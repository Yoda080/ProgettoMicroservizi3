using Microsoft.EntityFrameworkCore;
using RentalService.Data;
using RentalService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models; 
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;

var builder = WebApplication.CreateBuilder(args);

// Aggiungi servizi al container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ✅ Configura Swagger per accettare i token JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Rental Service API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Configura il DbContext
builder.Services.AddDbContext<RentalDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptionsAction => sqlServerOptionsAction.EnableRetryOnFailure()));

// Aggiungi HttpClient factory
builder.Services.AddHttpClient();

// Aggiungi HttpContextAccessor per accedere al token JWT
builder.Services.AddHttpContextAccessor();

// ✅ Aggiungi IHttpClientService
builder.Services.AddScoped<IHttpClientService, HttpClientService>();

// ✅ Configurazione JWT Authentication corretta
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"] ?? string.Empty);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
        
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("Token validated successfully");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// 🟢 CORREZIONE CORS: Policy aperta per lo sviluppo
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            // Abilita l'origine del frontend
            policy.WithOrigins("http://localhost:3000") 
                // Devi esporre tutti gli header per JWT e Content-Type
                .AllowAnyHeader()
                // Devi permettere tutti i metodi (GET, POST, ecc.)
                .AllowAnyMethod()
                // Questa riga è spesso richiesta in scenari di sviluppo (anche se usiamo un mock token)
                .AllowCredentials(); 
        });
});

var app = builder.Build();

// Esegui le migrazioni del database all'avvio
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<RentalDbContext>();
        Console.WriteLine("Applying Rentals migrations...");
        dbContext.Database.Migrate();
        Console.WriteLine("Rentals migrations applied successfully!");
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while applying Rentals database migrations.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Rimosso se lavori solo con HTTP in Docker

// 🟢 POSIZIONAMENTO CRUCIALE: app.UseCors() DEVE essere prima di app.UseAuthorization() e app.UseEndpoints/MapControllers
app.UseCors(); 

// ✅ Middleware di autenticazione e autorizzazione
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

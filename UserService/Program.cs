using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using UserService.Data;
using UserService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Database
builder.Services.AddDbContext<UserDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// HttpClient
builder.Services.AddHttpClient();
builder.Services.AddScoped<IHttpClientService, HttpClientService>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 32)
{
    throw new InvalidOperationException("JWT SecretKey must be at least 32 characters long");
}

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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddHealthChecks()
    .AddDbContextCheck<UserDbContext>();

// La configurazione di Firebase Firestore è stata rimossa per evitare conflitti con SQL Server.

var app = builder.Build();

// *** INIZIO DEL BLOCCO DI CODICE AGGIUNTO ***
// Esegui le migrazioni del database all'avvio
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<UserDbContext>();
        Console.WriteLine("Applying migrations...");
        dbContext.Database.Migrate();
        Console.WriteLine("Migrations applied successfully!");
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while applying database migrations.");
    }
}
// *** FINE DEL BLOCCO AGGIUNTO ***


// ⚠️ MIDDLEWARE DI DEBUGGING - PRIMO
app.Use(async (context, next) =>
{
    Console.WriteLine($"📨 Request: {context.Request.Method} {context.Request.Path}");
    await next();
});

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ⚠️ ENDPOINT DI TEST - PRIMA del middleware
app.MapGet("/", () => "Backend .NET is running! ✅");
app.MapGet("/test", () => Results.Ok(new { message = "Test endpoint works!", timestamp = DateTime.Now }));
app.MapGet("/api/Auth/status", () => Results.Ok(new { status = "OK", message = "Auth service running" }));
app.MapGet("/health", () => Results.Ok(new { status = "Healthy" }));

// ⚠️ ORDINE CORRETTO DEL MIDDLEWARE
app.UseHttpsRedirection();
app.UseCors("AllowReactApp"); // CORS PRIMA di Authentication
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ⚠️ MESSAGGIO DI AVVIO
Console.WriteLine("🚀 Backend started on: http://localhost:5001");
Console.WriteLine("🚀 Backend started on: https://localhost:7001");
Console.WriteLine("📊 Endpoints available:");
Console.WriteLine("  - http://localhost:5001/");
Console.WriteLine("  - http://localhost:5001/test");
Console.WriteLine("  - http://localhost:5001/api/Auth/status");
Console.WriteLine("  - http://localhost:5001/health");
Console.WriteLine("  - https://localhost:7001/");
Console.WriteLine("  - https://localhost:7001/swagger");

// Database connection test
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<UserDbContext>();
    try
    {
        var canConnect = await dbContext.Database.CanConnectAsync();
        if (canConnect)
        {
            Console.WriteLine("✅ Database connection successful!");
        }
        else
        {
            Console.WriteLine("❌ Cannot connect to database (but no exception)");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database connection failed: {ex.Message}");
        Console.WriteLine($"🔧 Check your connection string: {builder.Configuration.GetConnectionString("DefaultConnection")}");
    }
}

app.Run();

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BankService.Data;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// 1. CONFIGURAZIONE DEI SERVIZI
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DATABASE CONTEXT CON RETRY POLICY MIGLIORATA
builder.Services.AddDbContext<PaymentsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 10,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        }));

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

// JWT CONFIGURATION
var secretKey = builder.Configuration.GetValue<string>("JwtSettings:SecretKey") 
                ?? "LaTuaChiaveSegretaSuperSicuraAlmeno32Caratteri";
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

var app = builder.Build();

// 2. MIDDLEWARE PIPELINE
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// 3. APPLICA MIGRAZIONI DATABASE
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<PaymentsDbContext>(); // ✅ CORRETTO
    try
    {
        dbContext.Database.Migrate();
        Console.WriteLine("Database migrato con successo");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Errore durante migrazione database: {ex.Message}");
    }
}

// 4. TEST CONNESSIONE DATABASE
await TestDatabaseConnection(app);

app.Run();

async Task TestDatabaseConnection(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<PaymentsDbContext>(); // ✅ CORRETTO
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    var maxRetries = 10;
    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            logger.LogInformation($"Tentativo di connessione al database {i + 1}/{maxRetries}...");
            
            // Prova a creare il database se non esiste
            await dbContext.Database.EnsureCreatedAsync();
            
            // Test di una query semplice
            var canConnect = await dbContext.Database.CanConnectAsync();
            
            if (canConnect)
            {
                logger.LogInformation("✅ Bank Service Database connection successful!");
                return;
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning($"❌ Tentativo {i + 1} fallito: {ex.Message}");
            
            if (i == maxRetries - 1)
            {
                logger.LogError("❌ Tutti i tentativi di connessione al database falliti!");
                logger.LogError($"Dettagli errore: {ex}");
            }
            
            await Task.Delay(5000 * (i + 1)); // Backoff esponenziale
        }
    }
}
using Microsoft.EntityFrameworkCore;
using ShoppingCartService.Data;
using Microsoft.AspNetCore.Cors; 
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ** CONFIGURAZIONE INIZIALE PER DOCKER **
builder.Configuration.AddEnvironmentVariables();
builder.WebHost.ConfigureKestrel(options =>
{
    // FIX 2: Usa la porta 5005, come definito nel docker-compose per il carrello.
    options.ListenAnyIP(5005); 
});
// --------------------------------------------------------------------------

// Aggiungi servizi al container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// AGGIUNGI LA CONFIGURAZIONE CORS
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

// Funzione helper per creare la connection string dinamica (CRUCIALE PER DOCKER)
string GetDockerConnectionString(IConfiguration config)
{
    // FIX 1: Forza l'uso di 'mssql' come host per il DB, ignorando 'localhost'
    var dbHost = "mssql"; 
    // Leggi la password dalla configurazione di Docker Compose, che usa il prefisso 'ConnectionStrings'
    var dbPassword = config["ConnectionStrings:DefaultConnection"]?.Split("Password=")[1]?.Split(";")[0] ?? "LaTuaPasswordComplessa123!";
    var dbName = "rentals_db"; 
    var dbUser = "sa"; 

    // Costruisce la stringa usando 'mssql' come host.
    var connectionString = $"Server={dbHost},1433;Initial Catalog={dbName};User Id={dbUser};Password={dbPassword};TrustServerCertificate=True;MultipleActiveResultSets=true;";
    
    Console.WriteLine($"⚙️ ShoppingCart DB Connection Host: {dbHost} on {dbName}");
    return connectionString;
}

// Configura il DbContext usando la stringa di connessione corretta
var dockerConnectionString = GetDockerConnectionString(builder.Configuration);

builder.Services.AddDbContext<ShoppingCartDbContext>(options =>
    options.UseSqlServer(dockerConnectionString)
);


// ** CONFIGURAZIONE JWT AUTHENTICATION **
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"] ?? "LaTuaChiaveSegretaSuperSicuraAlmeno32Caratteri");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
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
    };
});
// -------------------------------------------------------------------------


var app = builder.Build();

// =================================================================
// LOGICA DI APPLICAZIONE DELLE MIGRAZIONI CON RETRY (RISOLVE CORSA)
// =================================================================
const int MaxRetries = 10;
const int DelaySeconds = 5;

for (int i = 0; i < MaxRetries; i++)
{
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ShoppingCartDbContext>();
            Console.WriteLine($"Tentativo {i + 1}/{MaxRetries}: Applying ShoppingCart migrations...");
            
            // La chiamata critica: tenta di connettersi e migrare
            dbContext.Database.Migrate(); 
            
            Console.WriteLine("✅ ShoppingCart migrations applied successfully!");
            break; 
        }
        catch (Exception ex)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            
            if (i == MaxRetries - 1)
            {
                logger.LogError(ex, "❌ ERRORE CRITICO: Fallito l'avvio delle migrazioni dopo {MaxRetries} tentativi. Interruzione dell'applicazione.", MaxRetries);
                throw; // CRUCIALE: Ferma l'app se il DB non è raggiungibile.
            }
            
            int currentDelay = DelaySeconds * (i + 1);
            logger.LogWarning(ex, "⚠️ Tentativo di migrazione fallito. Riprovo tra {DelaySeconds} secondi. Causa: {Message}", currentDelay, ex.Message);
            
            Thread.Sleep(currentDelay * 1000); 
        }
    }
}
// =================================================================


// Configura la pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// USA CORS PRIMA DI TUTTO 
app.UseCors("AllowReactApp"); 

app.UseHttpsRedirection();

// Abilita l'autenticazione prima dell'autorizzazione
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
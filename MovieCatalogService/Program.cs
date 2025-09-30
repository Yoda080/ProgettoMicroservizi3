using Microsoft.EntityFrameworkCore;
using MovieCatalogService.Data;
using MovieCatalogService.Services;
using Microsoft.AspNetCore.Cors;

var builder = WebApplication.CreateBuilder(args);

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

// Configura il DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<MovieDbContext>(options =>
    options.UseSqlServer(connectionString)
);

// Aggiungi HttpClient factory
builder.Services.AddHttpClient();

// Aggiungi servizio per comunicazione tra microservizi
builder.Services.AddScoped<IHttpClientService, HttpClientService>();

var app = builder.Build();

// *** INIZIO DEL BLOCCO DI CODICE AGGIUNTO E CORRETTO ***
// Esegui le migrazioni e il seeding del database all'avvio
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<MovieDbContext>();
        Console.WriteLine("Applying Movie Catalog migrations...");
        dbContext.Database.Migrate();
        Console.WriteLine("Movie Catalog migrations applied successfully!");

        // Chiama il metodo di seeding per popolare il database
        DbInitializer.SeedData(dbContext);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while applying database migrations and seeding.");
    }
}
// *** FINE DEL BLOCCO AGGIUNTO E CORRETTO ***

// Configura la pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// USA CORS PRIMA DI TUTTO 
app.UseCors("AllowReactApp");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
using RentalService.Data;
using RentalService.Models;
using Microsoft.EntityFrameworkCore;

namespace RentalService.Services
{
    public interface IRentalService
    {
        Task<bool> CreateRentalAsync(string userId, List<int> movieIds, decimal totalAmount);
        Task<List<UserRentalDto>> GetUserRentalsAsync(string userId);
    }

    // 🟢 AGGIUNGI: DTO per i noleggi utente
    public class UserRentalDto
    {
        public int Id { get; set; }
        public int MovieId { get; set; }
        public DateTime RentedAt { get; set; }
        public DateTime DueDate { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = string.Empty;
        public int DaysRemaining { get; set; }
    }

    public class RentalServiceImpl : IRentalService
    {
        private readonly RentalDbContext _context;
        private readonly ILogger<RentalServiceImpl> _logger;

        public RentalServiceImpl(RentalDbContext context, ILogger<RentalServiceImpl> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> CreateRentalAsync(string userId, List<int> movieIds, decimal totalAmount)
        {
            try
            {
                _logger.LogInformation("🎬 Creazione noleggi per user {UserId} con {MovieCount} film: {MovieIds}", 
                    userId, movieIds.Count, string.Join(", ", movieIds));

                var rentals = new List<Rental>();
                
                foreach (var movieId in movieIds)
                {
                    var rental = new Rental
                    {
                        UserId = userId,
                        MovieId = movieId,
                        RentedAt = DateTime.UtcNow,
                        DueDate = DateTime.UtcNow.AddDays(7),
                        TotalPrice = totalAmount / movieIds.Count,
                        Status = "Active"
                    };
                    
                    rentals.Add(rental);
                    _logger.LogInformation("➕ Creato noleggio per MovieId: {MovieId}, Prezzo: {Price}", 
                        movieId, rental.TotalPrice);
                }

                _logger.LogInformation("💾 Salvando {Count} noleggi nel database...", rentals.Count);
                
                await _context.Rentals.AddRangeAsync(rentals);
                var saved = await _context.SaveChangesAsync();
                
                _logger.LogInformation("✅ Salvati {Saved} noleggi con successo", saved);
                _logger.LogInformation("✅ Creati {Count} noleggi per user {UserId}", rentals.Count, userId);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Errore nella creazione dei noleggi per user {UserId}", userId);
                _logger.LogError("❌ StackTrace: {StackTrace}", ex.StackTrace);
                _logger.LogError("❌ InnerException: {InnerException}", ex.InnerException?.Message);
                return false;
            }
        }

        // 🟢 AGGIUNGI: Implementazione del metodo per ottenere i noleggi dell'utente
        public async Task<List<UserRentalDto>> GetUserRentalsAsync(string userId)
        {
            try
            {
                _logger.LogInformation("📋 Recupero noleggi per user: {UserId}", userId);

                var rentals = await _context.Rentals
                    .Where(r => r.UserId == userId && r.Status == "Active")
                    .OrderByDescending(r => r.RentedAt)
                    .Select(r => new UserRentalDto
                    {
                        Id = r.Id,
                        MovieId = r.MovieId,
                        RentedAt = r.RentedAt,
                        DueDate = r.DueDate,
                        TotalPrice = r.TotalPrice,
                        Status = r.Status,
                        DaysRemaining = (r.DueDate - DateTime.UtcNow).Days
                    })
                    .ToListAsync();

                _logger.LogInformation("✅ Trovati {Count} noleggi per user {UserId}", rentals.Count, userId);
                return rentals;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Errore nel recupero noleggi per user {UserId}", userId);
                throw;
            }
        }
    }
}
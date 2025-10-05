using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShoppingCartService.Data;
using ShoppingCartService.Models;
using System.Text.Json;

namespace ShoppingCartService.Controllers
{
    // Modelli di richiesta
    public class AddToCartRequest
    {
        public int UserId { get; set; }
        public int MovieId { get; set; }
        public decimal Price { get; set; }
    }

    public class SaveRentalsRequest
    {
        public int UserId { get; set; }
        public List<RentalItem> Rentals { get; set; } = new List<RentalItem>();
    }

    public class RentalItem
    {
        public int MovieId { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string RentalDate { get; set; } = string.Empty;
        public string ExpirationDate { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ShoppingCartDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public CartController(ShoppingCartDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        // POST /api/cart/add
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            if (request.UserId <= 0 || request.MovieId <= 0 || request.Price <= 0)
            {
                return BadRequest(new { Message = "Dati di richiesta non validi." });
            }

            var cart = await _context.ShoppingCarts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == request.UserId);

            if (cart == null)
            {
                cart = new ShoppingCart
                {
                    UserId = request.UserId,
                    CreatedAt = DateTime.Now
                };
                _context.ShoppingCarts.Add(cart);
                await _context.SaveChangesAsync();
                Console.WriteLine($"🛒 Creato un nuovo carrello (ID: {cart.Id}) per l'utente {request.UserId}.");
            }

            var existingItem = cart.Items.FirstOrDefault(i => i.MovieId == request.MovieId);

            if (existingItem != null)
            {
                existingItem.Quantity++;
                existingItem.PriceAtTime = request.Price; 
                _context.CartItems.Update(existingItem);
            }
            else
            {
                var newItem = new CartItem
                {
                    CartId = cart.Id,
                    MovieId = request.MovieId,
                    PriceAtTime = request.Price,
                    Quantity = 1
                };
                cart.Items.Add(newItem);
            }

            await _context.SaveChangesAsync();
            
            var totalItems = cart.Items.Sum(i => i.Quantity);
            var cartTotal = cart.Items.Sum(i => i.Quantity * i.PriceAtTime);

            return Ok(new
            {
                CartId = cart.Id,
                UserId = cart.UserId,
                TotalItems = totalItems,
                CartTotal = cartTotal,
                Items = cart.Items.Select(i => new { i.MovieId, i.Quantity, i.PriceAtTime })
            });
        }
        
        // GET /api/cart/{userId}
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetCart(int userId)
        {
            var cart = await _context.ShoppingCarts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return NotFound(new { Message = "Carrello non trovato per l'utente specificato." });
            }
            
            var totalItems = cart.Items.Sum(i => i.Quantity);
            var cartTotal = cart.Items.Sum(i => i.Quantity * i.PriceAtTime);

            return Ok(new
            {
                CartId = cart.Id,
                UserId = cart.UserId,
                TotalItems = totalItems,
                CartTotal = cartTotal,
                Items = cart.Items.Select(i => new { i.MovieId, i.Quantity, i.PriceAtTime })
            });
        }

        // POST /api/cart/save-rentals
        [HttpPost("save-rentals")]
        public async Task<IActionResult> SaveRentals([FromBody] SaveRentalsRequest request)
        {
            try
            {
                Console.WriteLine($"💾 Salvataggio {request.Rentals.Count} noleggi per user {request.UserId}");

                foreach (var rental in request.Rentals)
                {
                    var userRental = new UserRental
                    {
                        UserId = request.UserId,
                        MovieId = rental.MovieId,
                        MovieTitle = rental.Title,
                        Price = rental.Price,
                        RentalDate = DateTime.Parse(rental.RentalDate),
                        ExpirationDate = DateTime.Parse(rental.ExpirationDate),
                        CreatedAt = DateTime.UtcNow
                    };
                    
                    _context.UserRentals.Add(userRental);
                }

                await _context.SaveChangesAsync();
                
                Console.WriteLine($"✅ Noleggi salvati con successo per user {request.UserId}");
                
                return Ok(new { 
                    success = true, 
                    message = $"Salvati {request.Rentals.Count} noleggi",
                    userId = request.UserId
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Errore nel salvataggio noleggi: {ex.Message}");
                return StatusCode(500, new { 
                    success = false, 
                    message = $"Errore nel salvataggio: {ex.Message}" 
                });
            }
        }

        // GET /api/cart/rentals/{userId}
        [HttpGet("rentals/{userId}")]
        public async Task<IActionResult> GetUserRentals(int userId)
        {
            try
            {
                Console.WriteLine($"📋 Recupero noleggi per user {userId}");

                var activeRentals = await _context.UserRentals
                    .Where(r => r.UserId == userId && r.ExpirationDate > DateTime.UtcNow)
                    .OrderByDescending(r => r.RentalDate)
                    .ToListAsync();

                Console.WriteLine($"✅ Trovati {activeRentals.Count} noleggi attivi per user {userId}");

                return Ok(new
                {
                    success = true,
                    rentals = activeRentals.Select(r => new
                    {
                        id = r.Id,
                        movieId = r.MovieId,
                        movieTitle = r.MovieTitle,
                        price = r.Price,
                        rentalDate = r.RentalDate.ToString("yyyy-MM-ddTHH:mm:ss"),
                        expirationDate = r.ExpirationDate.ToString("yyyy-MM-ddTHH:mm:ss"),
                        isActive = r.ExpirationDate > DateTime.UtcNow,
                        daysRemaining = (int)(r.ExpirationDate - DateTime.UtcNow).TotalDays
                    }),
                    count = activeRentals.Count,
                    message = $"Trovati {activeRentals.Count} noleggi attivi"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Errore nel recupero noleggi: {ex.Message}");
                return StatusCode(500, new { 
                    success = false, 
                    message = $"Errore nel recupero noleggi: {ex.Message}" 
                });
            }
        }

        // DELETE /api/cart/rentals/expired
        [HttpDelete("rentals/expired")]
        public async Task<IActionResult> CleanExpiredRentals()
        {
            try
            {
                var expiredRentals = await _context.UserRentals
                    .Where(r => r.ExpirationDate <= DateTime.UtcNow)
                    .ToListAsync();

                if (expiredRentals.Any())
                {
                    _context.UserRentals.RemoveRange(expiredRentals);
                    await _context.SaveChangesAsync();
                    
                    Console.WriteLine($"🗑️ Rimossi {expiredRentals.Count} noleggi scaduti");
                    
                    return Ok(new { 
                        success = true, 
                        message = $"Rimossi {expiredRentals.Count} noleggi scaduti" 
                    });
                }
                
                return Ok(new { 
                    success = true, 
                    message = "Nessun noleggio scaduto da rimuovere" 
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Errore nella pulizia noleggi scaduti: {ex.Message}");
                return StatusCode(500, new { 
                    success = false, 
                    message = $"Errore nella pulizia: {ex.Message}" 
                });
            }
        }

        // GET /api/cart/rentals/stats/{userId}
        [HttpGet("rentals/stats/{userId}")]
        public async Task<IActionResult> GetRentalStats(int userId)
        {
            try
            {
                var totalRentals = await _context.UserRentals
                    .Where(r => r.UserId == userId)
                    .CountAsync();

                var activeRentals = await _context.UserRentals
                    .Where(r => r.UserId == userId && r.ExpirationDate > DateTime.UtcNow)
                    .CountAsync();

                var totalSpent = await _context.UserRentals
                    .Where(r => r.UserId == userId)
                    .SumAsync(r => r.Price);

                return Ok(new
                {
                    success = true,
                    stats = new
                    {
                        totalRentals,
                        activeRentals,
                        expiredRentals = totalRentals - activeRentals,
                        totalSpent
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    message = $"Errore nel recupero statistiche: {ex.Message}" 
                });
            }
        }
    }
}
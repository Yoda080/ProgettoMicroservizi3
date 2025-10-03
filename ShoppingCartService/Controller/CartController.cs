using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShoppingCartService.Data;
using ShoppingCartService.Models;
using System.Text.Json;

namespace ShoppingCartService.Controllers
{
    // Modello di richiesta per l'aggiunta di un item al carrello
    public class AddToCartRequest
    {
        public int UserId { get; set; }
        public int MovieId { get; set; }
        public decimal Price { get; set; } // Il prezzo del film al momento dell'aggiunta
    }

    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ShoppingCartDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        // Inietta il DbContext e HttpClientFactory per comunicare con MovieCatalogService
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

            // 1. Verifica se un carrello esiste per l'utente, altrimenti creane uno.
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

            // 2. Controlla se l'elemento è già nel carrello e aggiorna la quantità, 
            //    altrimenti aggiungi un nuovo CartItem.
            var existingItem = cart.Items.FirstOrDefault(i => i.MovieId == request.MovieId);

            if (existingItem != null)
            {
                existingItem.Quantity++;
                // Aggiorna il prezzo (può essere utile se il prezzo è cambiato nel frattempo)
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
            
            // 3. Risposta
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
        
        // GET /api/cart/{userId} - Per ottenere il contenuto del carrello
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
    }
}

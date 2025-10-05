using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using RentalService.Services;
using RentalService.Models;
using System.Security.Claims;

namespace RentalService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RentalsController : ControllerBase
    {
        private readonly IRentalService _rentalService;
        private readonly ILogger<RentalsController> _logger;

        public RentalsController(IRentalService rentalService, ILogger<RentalsController> logger)
        {
            _rentalService = rentalService;
            _logger = logger;
        }

      [HttpPost("checkout")]
public async Task<ActionResult> Checkout([FromBody] CheckoutRequest request)
{
    try
    {
        _logger.LogInformation("📥 Ricevuta richiesta checkout");

        if (request == null)
        {
            return BadRequest(new { message = "Request body is required" });
        }

        if (request.Items == null || !request.Items.Any())
        {
            return BadRequest(new { message = "Items are required" });
        }

        if (request.TotalAmount <= 0)
        {
            return BadRequest(new { message = "TotalAmount must be greater than 0" });
        }

        // 🟢 CORREZIONE: Cerca il claim nameidentifier che contiene "1"
        var userId = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value
                  ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("nameid")?.Value
                  ?? User.FindFirst("unique_name")?.Value
                  ?? User.FindFirst("userId")?.Value 
                  ?? User.FindFirst("sub")?.Value;

        _logger.LogInformation("🔍 User ID estratto: {UserId}", userId ?? "NULL");

        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("❌ User ID non trovato. Claims disponibili:");
            foreach (var claim in User.Claims)
            {
                _logger.LogWarning($"  {claim.Type}: {claim.Value}");
            }
            return Unauthorized(new { message = "User ID not found in token" });
        }

        _logger.LogInformation("🎯 Creazione noleggio per user {UserId} con {ItemCount} items", userId, request.Items.Count);

        var success = await _rentalService.CreateRentalAsync(userId, request.Items, request.TotalAmount);

        if (!success)
        {
            return BadRequest(new { message = "Failed to create rental" });
        }

        return Ok(new { 
            success = true,
            message = "Rental created successfully"
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "❌ Errore durante il checkout");
        return StatusCode(500, new { 
            success = false,
            message = "Internal server error"
        });
    }
}

        [HttpGet("my-rentals")]
        [Authorize]
        public async Task<ActionResult> GetMyRentals()
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value 
                          ?? User.FindFirst("sub")?.Value 
                          ?? User.FindFirst("nameid")?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                _logger.LogInformation("📋 Recupero noleggi per user: {UserId}", userId);

                var rentals = await _rentalService.GetUserRentalsAsync(userId);

                _logger.LogInformation("✅ Trovati {Count} noleggi per user {UserId}", rentals.Count, userId);

                return Ok(new 
                {
                    success = true,
                    rentals = rentals,
                    totalRentals = rentals.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Errore nel recupero dei noleggi");
                return StatusCode(500, new { 
                    success = false,
                    message = "Errore interno nel recupero dei noleggi"
                });
            }
        }

        [HttpGet("test")]
        [AllowAnonymous]
        public IActionResult Test()
        {
            return Ok(new { message = "Rental service is working!" });
        }

        // 🟢 AGGIUNGI: Endpoint di debug per il token
        [HttpGet("debug-token")]
        [Authorize]
        public IActionResult DebugToken()
        {
            var claims = User.Claims.Select(c => new { Type = c.Type, Value = c.Value }).ToList();
            
            _logger.LogInformation("🔍 DEBUG TOKEN - Tutti i claims:");
            foreach (var claim in claims)
            {
                _logger.LogInformation($"  {claim.Type}: {claim.Value}");
            }

            return Ok(new 
            {
                claims = claims,
                message = "Controlla i log per tutti i claims"
            });
        }
    }

    public class CheckoutRequest
    {
        public List<int> Items { get; set; } = new List<int>();
        public decimal TotalAmount { get; set; }
    }
}
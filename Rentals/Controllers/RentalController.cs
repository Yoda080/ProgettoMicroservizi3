using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using RentalService.Services;

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

        // 🟢 CORREZIONE: Estrai l'User ID in modo più robusto
        var userId = User.FindFirst("userId")?.Value 
                  ?? User.FindFirst("sub")?.Value 
                  ?? User.FindFirst("nameid")?.Value
                  ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value
                  ?? User.Identity?.Name;

        _logger.LogInformation($"🔍 User claims: {string.Join(", ", User.Claims.Select(c => $"{c.Type}: {c.Value}"))}");

        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("❌ User ID non trovato nel token. Claims disponibili:");
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

        [HttpGet("test")]
        [AllowAnonymous]
        public IActionResult Test()
        {
            return Ok(new { message = "Rental service is working!" });
        }
    }

    public class CheckoutRequest
    {
        public List<int> Items { get; set; } = new List<int>();
        public decimal TotalAmount { get; set; }
    }
}
using Microsoft.AspNetCore.Mvc;
using RentalService.Data;
using RentalService.Models;
using RentalService.Services;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Security.Authentication;

namespace RentalService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RentalsController : ControllerBase
    {
        private readonly RentalDbContext _context;
        private readonly IHttpClientService _httpClientService;

        public RentalsController(RentalDbContext context, IHttpClientService httpClientService)
        {
            _context = context;
            _httpClientService = httpClientService;
        }

        /// <summary>
        /// Helper method to get the user ID from the JWT token claims.
        /// </summary>
        private string GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                throw new AuthenticationException("User ID not found in token.");
            }
            return userIdClaim.Value;
        }

        [HttpPost]
        public async Task<IActionResult> RentMovie([FromBody] RentalRequest request)
        {
            try
            {
                // ✅ Ottieni l'ID utente dal token come stringa
                var userId = GetUserIdFromToken();

                var movieExists = await _httpClientService.ExistsAsync("MovieService", $"api/movies/exists/{request.MovieId}");
                if (!movieExists)
                {
                    return NotFound($"Movie with ID {request.MovieId} not found");
                }

                decimal moviePrice;
                try
                {
                    moviePrice = await _httpClientService.GetAsync<decimal>("MovieService", $"api/movies/{request.MovieId}/price");
                }
                catch
                {
                    moviePrice = 4.99m;
                }

                // ✅ Usa l'ID utente come stringa nel noleggio
                var rental = new Rental
                {
                    UserId = userId, // Ora è una stringa
                    MovieId = request.MovieId,
                    RentedAt = DateTime.UtcNow,
                    DueDate = DateTime.UtcNow.AddDays(7),
                    TotalPrice = moviePrice,
                    ReturnedAt = null
                };

                _context.Rentals.Add(rental);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Movie rented successfully",
                    rentalId = rental.Id,
                    totalPrice = moviePrice
                });
            }
            catch (AuthenticationException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUserRentals()
        {
            try
            {
                // ✅ Filtra i noleggi in base all'ID dell'utente autenticato come stringa
                var userId = GetUserIdFromToken();

                var rentals = await _context.Rentals
                                            .Where(r => r.UserId == userId)
                                            .ToListAsync();
                return Ok(rentals);
            }
            catch (AuthenticationException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpPost("return/{id}")]
        public async Task<IActionResult> ReturnMovie(int id)
        {
            try
            {
                // ✅ Verifica che l'utente stia cercando di restituire un proprio film
                var userId = GetUserIdFromToken();

                var rental = await _context.Rentals
                                           .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

                if (rental == null)
                {
                    return NotFound("Rental not found or does not belong to the current user.");
                }

                if (rental.ReturnedAt != null)
                {
                    return BadRequest("Movie has already been returned.");
                }

                rental.ReturnedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok("Movie returned successfully.");
            }
            catch (AuthenticationException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }

    public class RentalRequest
    {
        public int MovieId { get; set; }
    }
}
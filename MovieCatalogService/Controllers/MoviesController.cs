using Microsoft.EntityFrameworkCore;
using MovieCatalogService.Data;
using MovieCatalogService.Models;
using Microsoft.AspNetCore.Mvc;
using MovieCatalogService.Services;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Cors;

namespace MovieCatalogService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowReactApp")]
    public class MoviesController : ControllerBase
    {
        private readonly MovieDbContext _context;
        private readonly IHttpClientService _httpClientService;

        public MoviesController(MovieDbContext context, IHttpClientService httpClientService)
        {
            _context = context;
            _httpClientService = httpClientService;
        }

        // GET: api/movies
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Movie>>> GetMovies()
        {
            return await _context.Movies.ToListAsync();
        }

        // GET: api/movies/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Movie>> GetMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null) return NotFound();
            return movie;
        }

        // POST: api/movies
        [HttpPost]
        public async Task<ActionResult<Movie>> CreateMovie([FromBody] MovieCreateRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var movie = new Movie
            {
                Title = request.Title,
                Description = request.Description,
                Director = request.Director,
                Price = request.Price,
                Duration = request.Duration,
                Category = request.Category,
                ReleaseYear = request.ReleaseYear,
                CreatedAt = DateTime.UtcNow
            };

            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMovie), new { id = movie.Id }, movie);
        }

        // PUT: api/movies/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMovie(int id, [FromBody] MovieUpdateRequest request)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null) return NotFound();

            movie.Title = request.Title;
            movie.Description = request.Description;
            movie.Director = request.Director;
            movie.Price = request.Price;
            movie.Duration = request.Duration;
            movie.Category = request.Category;
            movie.ReleaseYear = request.ReleaseYear;

            await _context.SaveChangesAsync();
            return Ok(movie);
        }

        // DELETE: api/movies/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null) return NotFound();

            // Verifica se ci sono rental attivi per questo film
            var hasActiveRentals = await _httpClientService.ExistsAsync(
                "RentalService", 
                $"api/rentals/movie/{id}/active"
            );

            if (hasActiveRentals)
            {
                return BadRequest("Cannot delete movie with active rentals");
            }

            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ENDPOINT PER ALTRI MICROSERVIZI (IMPORTANTI!)

        // GET: api/movies/exists/5
      [HttpGet("exists/{id}")]
public async Task<IActionResult> CheckMovieExists(int id)
{
    try
    {
        var movie = await _context.Movies.FindAsync(id);
        
        // Gestione esplicita dei valori null
        if (movie == null)
        {
            return Ok(false);
        }
        
        // Se il film esiste, verifica anche che i campi obbligatori non siano null
        if (string.IsNullOrEmpty(movie.Title))
        {
            // Se il titolo è null, considera comunque il film come esistente
            // ma logga il problema
            Console.WriteLine($"Movie {id} exists but has null title");
        }
        
        return Ok(true);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error checking movie existence: {ex.Message}");
        return StatusCode(500, "Error checking movie existence");
    }
}

        // GET: api/movies/5/price
        [HttpGet("{id}/price")]
        public async Task<IActionResult> GetMoviePrice(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null) return NotFound();
            return Ok(movie.Price);
        }

        // GET: api/movies/5/details
        [HttpGet("{id}/details")]
        public async Task<IActionResult> GetMovieDetails(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null) return NotFound();

            return Ok(new {
                movie.Id,
                movie.Title,
                movie.Price,
                movie.Description,
                movie.Director,
                movie.Duration,
                movie.Category,
                movie.ReleaseYear
            });
        }

        // GET: api/movies/check-rentals/5
        [HttpGet("check-rentals/{id}")]
        public async Task<IActionResult> CheckMovieRentals(int id)
        {
            try
            {
                // Chiama RentalService per verificare i rental di questo film
                var rentalCount = await _httpClientService.GetAsync<int>(
                    "RentalService", 
                    $"api/rentals/movie/{id}/count"
                );

                return Ok(new { 
                    movieId = id, 
                    rentalCount = rentalCount,
                    hasRentals = rentalCount > 0 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error checking rentals: {ex.Message}");
            }
        }

        // METODO PRIVATO PER USO INTERNO - RINOMINA
        private bool MovieExistsInDatabase(int id)
        {
            return _context.Movies.Any(e => e.Id == id);
        }
    }

    // Classi per le request
    public class MovieCreateRequest
    {
        [Required(ErrorMessage = "Il titolo è obbligatorio")]
        [StringLength(100, ErrorMessage = "Il titolo non può superare 100 caratteri")]
        public string Title { get; set; }

        [StringLength(500, ErrorMessage = "La descrizione non può superare 500 caratteri")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Il prezzo è obbligatorio")]
        [Range(0.01, 100, ErrorMessage = "Il prezzo deve essere tra 0.01 e 100")]
        public decimal Price { get; set; }

        [StringLength(100, ErrorMessage = "Il nome del regista non può superare 100 caratteri")]
        public string Director { get; set; }


        [Required(ErrorMessage = "La durata è obbligatoria")]
        [Range(1, 300, ErrorMessage = "La durata deve essere tra 1 e 300 minuti")]
        public int Duration { get; set; }

        [StringLength(50, ErrorMessage = "La categoria non può superare 50 caratteri")]
        public string Category { get; set; }

        [Range(1900, 2100, ErrorMessage = "L'anno di release deve essere tra 1900 e 2100")]
        public int ReleaseYear { get; set; }
    }

    public class MovieUpdateRequest
    {
        [Required(ErrorMessage = "Il titolo è obbligatorio")]
        [StringLength(100, ErrorMessage = "Il titolo non può superare 100 caratteri")]
        public string Title { get; set; }

        [StringLength(500, ErrorMessage = "La descrizione non può superare 500 caratteri")]
        public string Description { get; set; }

        [StringLength(100, ErrorMessage = "Il nome del regista non può superare 100 caratteri")]
        public string Director { get; set; }

        [Required(ErrorMessage = "Il prezzo è obbligatorio")]
        [Range(0.01, 100, ErrorMessage = "Il prezzo deve essere tra 0.01 e 100")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "La durata è obbligatoria")]
        [Range(1, 300, ErrorMessage = "La durata deve essere tra 1 e 300 minuti")]
        public int Duration { get; set; }

        [StringLength(50, ErrorMessage = "La categoria non può superare 50 caratteri")]
        public string Category { get; set; }

        [Range(1900, 2100, ErrorMessage = "L'anno di release deve essere tra 1900 e 2100")]
        public int ReleaseYear { get; set; }
    }
}
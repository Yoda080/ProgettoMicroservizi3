using Microsoft.AspNetCore.Mvc;
using UserService.Data;
using UserService.Models;
using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;

namespace UserService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowReactApp")] // Abilita CORS per questo controller
    public class AuthController : ControllerBase
    {
        private readonly UserDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(UserDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("user/{id}")]
public async Task<ActionResult<User>> GetUser(int id)
{
    var user = await _context.Users.FindAsync(id);
    if (user == null)
    {
        return NotFound();
    }
    return user;
}

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegistrationRequest request)
        {
            try
            {
                // Validazione del modello
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Verifica se l'email esiste già
                if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                {
                    return Conflict(new { message = "L'email è già in uso." });
                }

                // Verifica se lo username esiste già
                if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                {
                    return Conflict(new { message = "Lo username è già in uso." });
                }

                var user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Genera token JWT dopo la registrazione
                var token = GenerateJwtToken(user);

                return Ok(new { 
                    message = "Registrazione completata con successo!", 
                    token = token,
                    userId = user.Id 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore interno del server", error = ex.Message });
            }
        }



        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginRequest request)
        {
            try
            {
                // Validazione del modello
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    return Unauthorized(new { message = "Credenziali non valide." });
                }

                // Genera token JWT
                var token = GenerateJwtToken(user);

                return Ok(new { 
                    message = "Login effettuato con successo",
                    token = token,
                    userId = user.Id,
                    username = user.Username
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errore interno del server", error = ex.Message });
            }
        }

        // Metodo per generare il token JWT
        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:SecretKey"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email)
                }),
                Expires = DateTime.UtcNow.AddHours(Convert.ToDouble(_configuration["JwtSettings:ExpireHours"] ?? "1")),
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // AGGIUNGI QUESTO METODO - GET: api/auth/me
[HttpGet("me")]
public async Task<IActionResult> GetCurrentUser()
{
    try
    {
        // Estrai l'ID utente dal token JWT
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Unauthorized(new { message = "Token non valido o utente non autenticato." });
        }

        if (!int.TryParse(userIdClaim, out int userId))
        {
            return BadRequest(new { message = "ID utente non valido nel token." });
        }

        var user = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { message = "Utente non trovato." });
        }

        return Ok(new
        {
            userId = user.Id,
            username = user.Username,
            email = user.Email,
            createdAt = user.CreatedAt
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Errore interno del server", error = ex.Message });
    }
}

        // GET: api/auth/check-email?email=test@example.com
        [HttpGet("check-email")]
        public async Task<IActionResult> CheckEmailExists([FromQuery] string email)
        {
            var exists = await _context.Users.AnyAsync(u => u.Email == email);
            return Ok(new { exists = exists });
        }

        // GET: api/auth/check-username?username=test
        [HttpGet("check-username")]
        public async Task<IActionResult> CheckUsernameExists([FromQuery] string username)
        {
            var exists = await _context.Users.AnyAsync(u => u.Username == username);
            return Ok(new { exists = exists });
        }
    }

    // Classi per i dati di richiesta con validazioni
    public class UserRegistrationRequest
    {
        [Required(ErrorMessage = "Lo username è obbligatorio")]
        [MinLength(3, ErrorMessage = "Lo username deve avere almeno 3 caratteri")]
        [MaxLength(50, ErrorMessage = "Lo username non può superare 50 caratteri")]
        public string Username { get; set; }

        [Required(ErrorMessage = "L'email è obbligatoria")]
        [EmailAddress(ErrorMessage = "Formato email non valido")]
        public string Email { get; set; }

        [Required(ErrorMessage = "La password è obbligatoria")]
        [MinLength(6, ErrorMessage = "La password deve avere almeno 6 caratteri")]
        public string Password { get; set; }
    }

    public class UserLoginRequest
    {
        [Required(ErrorMessage = "L'email è obbligatoria")]
        [EmailAddress(ErrorMessage = "Formato email non valido")]
        public string Email { get; set; }

        [Required(ErrorMessage = "La password è obbligatoria")]
        public string Password { get; set; }
    }
}
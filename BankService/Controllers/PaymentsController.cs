using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BankService.Data; // Ora punta al namespace dove PaymentsDbContext è definito
using BankService.Models;
using System.Security.Claims;
using System.Globalization; 
using System.Threading.Tasks;

// Modello DTO per la richiesta di deposito
public class DepositRequest
{
    public decimal Amount { get; set; }
    public string? Currency { get; set; } 
}

// Modello DTO per la risposta del saldo
public class BalanceResponse
{
    public decimal Balance { get; set; }
}

namespace BankService.Controllers
{
    [Authorize] 
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        // 🎯 CORREZIONE: Usa il nome del tuo DbContext: PaymentsDbContext
        private readonly PaymentsDbContext _context; 

        // 🎯 CORREZIONE: Usa PaymentsDbContext nel costruttore
        public PaymentsController(PaymentsDbContext context) 
        {
            _context = context;
        }

        /**
         * Funzione di supporto per ottenere l'ID utente (stringa) dal token JWT.
         */
        private string GetUserId()
        {
            // L'ID utente viene letto dal claim (stringa)
            // Usiamo NameIdentifier o "sub" (standard JWT)
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            
            if (string.IsNullOrEmpty(userId))
            {
                // Lancio un'eccezione, il chiamante dovrà gestirla
                throw new UnauthorizedAccessException("User ID (string) not found in token claims.");
            }
            return userId; // Restituisce la STRINGA
        }

        /// <summary>
        /// Recupera il saldo corrente dell'utente autenticato.
        /// </summary>
        [HttpGet("balance")]
        [ProducesResponseType(200, Type = typeof(BalanceResponse))]
        [ProducesResponseType(401)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetBalance()
        {
            try
            {
                var userId = GetUserId(); // userId è STRINGA

                // Nota: BankAccount è mappato a 'Accounts' nel tuo DbContext, non 'BankAccounts'.
                // Uso il nome del DbSet che hai definito: Accounts
                var account = await _context.Accounts 
                    .FirstOrDefaultAsync(a => a.UserId == userId); 

                if (account == null)
                {
                    // Crea un nuovo conto se non esiste
                    account = new BankAccount 
                    { 
                        UserId = userId, // Assegna stringa a stringa
                        AccountNumber = Guid.NewGuid().ToString().Replace("-", "")[..12], 
                        Balance = 0 
                    }; 
                    _context.Accounts.Add(account);
                    await _context.SaveChangesAsync();
                }

                return Ok(new BalanceResponse { Balance = account.Balance });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Errore in GetBalance: {ex.Message}");
                return StatusCode(500, new { Message = "Errore interno durante il recupero del saldo." });
            }
        }


        /// <summary>
        /// Gestisce un'operazione di deposito sul conto dell'utente autenticato.
        /// </summary>
        [HttpPost("deposit")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Deposit([FromBody] DepositRequest request)
        {
            if (request.Amount <= 0)
            {
                return BadRequest(new { Message = "L'importo del deposito deve essere maggiore di zero." });
            }

            try
            {
                var userId = GetUserId(); // userId è STRINGA

                // 1. Trova o crea l'account
                // Nota: BankAccount è mappato a 'Accounts' nel tuo DbContext, non 'BankAccounts'.
                var account = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.UserId == userId); 

                if (account == null)
                {
                    // Crea un nuovo conto se non esiste
                    account = new BankAccount 
                    { 
                        UserId = userId, // Assegna stringa a stringa
                        AccountNumber = Guid.NewGuid().ToString().Replace("-", "")[..12], 
                        Balance = 0 
                    };
                    _context.Accounts.Add(account);
                }

                account.Balance += request.Amount;

                // 3. Registra la transazione
                var transaction = new Transaction
                {
                    UserId = userId, // Assegna stringa a stringa
                    Amount = request.Amount,
                    Type = "Deposit",
                    Description = $"Deposito di {request.Amount.ToString("C", CultureInfo.CurrentCulture)}", 
                    TransactionDate = DateTime.UtcNow 
                };
                
                _context.Transactions.Add(transaction);

                // 4. Salva tutte le modifiche 
                await _context.SaveChangesAsync();

                return Ok(new 
                {
                    transactionId = transaction.Id,
                    newBalance = account.Balance,
                    message = "Deposito completato con successo."
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Errore nel Deposit: {ex.Message}");
                return StatusCode(500, new { Message = "Errore interno durante l'elaborazione del deposito." });
            }
        }
    }
}

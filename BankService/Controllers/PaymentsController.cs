using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BankService.Data;
using BankService.Models;
using System.Security.Claims;
using System.Globalization; 

// Modelli DTO
public class DepositRequest
{
    public decimal Amount { get; set; }
    public string? Currency { get; set; } 
}

public class DebitRequest
{
    public decimal Amount { get; set; }
}

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
        private readonly PaymentsDbContext _context; 

        public PaymentsController(PaymentsDbContext context) 
        {
            _context = context;
        }

        private string GetUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            
            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token claims.");
            }
            return userId;
        }

        [HttpGet("balance")]
        public async Task<IActionResult> GetBalance()
        {
            try
            {
                var userId = GetUserId();
                var account = await _context.Accounts 
                    .FirstOrDefaultAsync(a => a.UserId == userId); 

                if (account == null)
                {
                    account = new BankAccount 
                    { 
                        UserId = userId,
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

        [HttpPost("deposit")]
        public async Task<IActionResult> Deposit([FromBody] DepositRequest request)
        {
            if (request.Amount <= 0)
            {
                return BadRequest(new { Message = "L'importo del deposito deve essere maggiore di zero." });
            }

            try
            {
                var userId = GetUserId();
                var account = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.UserId == userId);

                if (account == null)
                {
                    account = new BankAccount 
                    { 
                        UserId = userId,
                        AccountNumber = Guid.NewGuid().ToString().Replace("-", "")[..12], 
                        Balance = 0 
                    };
                    _context.Accounts.Add(account);
                }

                account.Balance += request.Amount;

                var transaction = new Transaction
                {
                    UserId = userId,
                    Amount = request.Amount,
                    Type = "Deposit",
                    Description = $"Deposito di {request.Amount.ToString("C", CultureInfo.CurrentCulture)}",
                    TransactionDate = DateTime.UtcNow
                };
                
                _context.Transactions.Add(transaction);
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

        [HttpPost("debit")]
        public async Task<IActionResult> Debit([FromBody] DebitRequest request)
        {
            if (request.Amount <= 0)
            {
                return BadRequest(new { Message = "L'importo del prelievo deve essere maggiore di zero." });
            }

            try
            {
                var userId = GetUserId();
                var account = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.UserId == userId);

                if (account == null)
                {
                    return BadRequest(new { Message = "Account non trovato." });
                }

                if (account.Balance < request.Amount)
                {
                    return BadRequest(new { Message = "Fondi insufficienti per completare l'operazione." });
                }

                account.Balance -= request.Amount;

                var transaction = new Transaction
                {
                    UserId = userId,
                    Amount = request.Amount,
                    Type = "Debit",
                    Description = $"Prelievo di {request.Amount.ToString("C", CultureInfo.CurrentCulture)}",
                    TransactionDate = DateTime.UtcNow
                };

                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                return Ok(new 
                {
                    transactionId = transaction.Id,
                    newBalance = account.Balance,
                    message = "Prelievo completato con successo."
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Errore nel Debit: {ex.Message}");
                return StatusCode(500, new { Message = "Errore interno durante l'elaborazione del prelievo." });
            }
        }
    }
}
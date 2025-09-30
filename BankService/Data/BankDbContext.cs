using Microsoft.EntityFrameworkCore;
using BankService.Models;

namespace BankService.Data
{
    // Il contesto del database per il BankService (gestisce le transazioni e i conti).
    public class PaymentsDbContext : DbContext
    {
        public PaymentsDbContext(DbContextOptions<PaymentsDbContext> options)
            : base(options)
        {
        }

        // DbSet per la tabella delle transazioni
        public DbSet<Transaction> Transactions { get; set; }

        // ✅ CORREZIONE: DbSet per la tabella dei conti correnti, utilizzando il modello BankAccount
        public DbSet<BankAccount> Accounts { get; set; } 
        
        // Se non hai bisogno di definire relazioni o tipi personalizzati, non serve l'override di OnModelCreating.
    }
}

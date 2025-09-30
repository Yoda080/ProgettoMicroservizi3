using System.ComponentModel.DataAnnotations.Schema;

namespace BankService.Models
{
    // Modello che rappresenta il saldo di un utente.
    [Table("bank_accounts")]
    public class BankAccount
    {
        public int Id { get; set; }
        
        // ✅ CORREZIONE: UserId è STRINGA per allinearsi al JWT e risolvere gli errori di conversione.
        [Column("user_id")]
        public string UserId { get; set; } = string.Empty; 
        
        [Column("account_number")]
        public string AccountNumber { get; set; } = string.Empty;
        
        [Column("balance", TypeName = "decimal(18, 2)")] // Usa TypeName per precisione
        public decimal Balance { get; set; } = 0m;
    }
}

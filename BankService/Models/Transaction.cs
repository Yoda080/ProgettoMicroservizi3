using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BankService.Models
{
    [Table("transactions")]
    public class Transaction
    {
        [Key]
        public int Id { get; set; }

        // 🎯 CRITICO: UserId è STRINGA, non int.
        [Required]
        [Column("user_id")]
        public string UserId { get; set; } = string.Empty;

        // Tipo di transazione
        [Required]
        [Column("type")]
        public string Type { get; set; } = string.Empty;

        // Importo
        [Required]
        [Column("amount", TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        // Descrizione (risolve il vecchio CS0117)
        [Required]
        [Column("description")]
        public string Description { get; set; } = string.Empty; 

        // Data (risolve il vecchio CS0117)
        [Column("transaction_date")]
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        // Riferimento opzionale esterno
        public string? ExternalReferenceId { get; set; }
    }
}

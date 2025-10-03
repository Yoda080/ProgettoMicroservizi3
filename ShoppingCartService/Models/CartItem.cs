using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShoppingCartService.Models
{
    // Corrisponde alla tabella CartItems
    public class CartItem
    {
        [Key]
        public int Id { get; set; }

        public int CartId { get; set; }

        // L'ID del film dal MovieCatalogService
        public int MovieId { get; set; } 

        public int Quantity { get; set; } = 1;

        // Prezzo al momento dell'aggiunta (per evitare errori di cambio prezzo)
        [Column(TypeName = "decimal(18, 2)")]
        public decimal PriceAtTime { get; set; }

        // Navigazione
        [ForeignKey("CartId")]
        public ShoppingCart Cart { get; set; }
    }
}

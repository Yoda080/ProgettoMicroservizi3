using System.ComponentModel.DataAnnotations;

namespace ShoppingCartService.Models
{
    // Corrisponde alla tabella ShoppingCarts
    public class ShoppingCart
    {
        [Key]
        public int Id { get; set; }

        // Riferimento all'utente (non facciamo una vera foreign key per i microservizi)
        public int UserId { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigazione: Contiene tutti gli elementi del carrello
        public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
    }
}

using System.ComponentModel.DataAnnotations;

namespace ShoppingCartService.Models
{
    public class UserRental
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int MovieId { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string MovieTitle { get; set; } = string.Empty;
        
        [Required]
        [Range(0.01, 999.99)]
        public decimal Price { get; set; }
        
        [Required]
        public DateTime RentalDate { get; set; }
        
        [Required]
        public DateTime ExpirationDate { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Proprietà calcolata
        public bool IsActive => ExpirationDate > DateTime.UtcNow;
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentalService.Models
{
    [Table("rentals", Schema = "dbo")]
    public class Rental
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("user_id")]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [Column("movie_id")]
        public int MovieId { get; set; }

        [Required]
        [Column("rented_at")]
        public DateTime RentedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("due_date")]
        public DateTime DueDate { get; set; } = DateTime.UtcNow.AddDays(7);

        [Column("returned_at")]
        public DateTime? ReturnedAt { get; set; }

        [Required]
        [Column("total_price")]
        public decimal TotalPrice { get; set; } // ✅ Senza Precision attribute

        [Required]
        [Column("status")]
        public string Status { get; set; } = "Active";
    }
}
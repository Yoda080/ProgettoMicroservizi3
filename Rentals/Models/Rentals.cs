using System;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
namespace RentalService.Models
{
    [Table("rentals_db", Schema = "dbo")]
    public class Rental
    {
        public int Id { get; set; }

        [Column("user_id")]
        public string UserId { get; set; }

        [Column("movie_id")]
        public int MovieId { get; set; }

        [Column("rented_at")]
        public DateTime RentedAt { get; set; }

        [Column("due_date")]
        public DateTime DueDate { get; set; }

        // Aggiungi queste proprietà se necessario
        [Column("returned_at")]
        public DateTime? ReturnedAt { get; set; } // Nullable per film non ancora restituiti

        [Column("total_price")]
        [Precision(10, 2)]
        public decimal TotalPrice { get; set; }
    }
}
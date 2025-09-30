using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieCatalogService.Models
{
    public class Movie
    {
        [Key] // Questo è essenziale per Entity Framework
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Range(0.01, 100)]
        public decimal? Price { get; set; }
        
        [StringLength(100)] // Attenzione: alcuni nomi di registi potrebbero essere troncati
        public string? Director { get; set; }

        [Range(1, 300)]
        public int? Duration { get; set; }

        [StringLength(50)]
        public string? Category { get; set; }

        [Range(1900, 2100)]
        public int? ReleaseYear { get; set; }

        public DateTime? CreatedAt { get; set; }
    }
}

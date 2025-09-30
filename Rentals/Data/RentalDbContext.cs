using Microsoft.EntityFrameworkCore;
using RentalService.Models;

namespace RentalService.Data
{
    public class RentalDbContext : DbContext
    {
        public RentalDbContext(DbContextOptions<RentalDbContext> options)
            : base(options)
        {
        }

        public DbSet<Rental> Rentals { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Rental>(entity =>
            {
                // Corretto per mappare alla tabella 'rentals' nello schema 'dbo'
                entity.ToTable("rentals", "dbo");
                
                entity.Property(e => e.TotalPrice)
                    .HasColumnName("total_price") // Aggiungi questa linea
                    .HasColumnType("decimal(10,2)")
                    .HasPrecision(10, 2);
                
                entity.Property(e => e.RentedAt)
                    .HasColumnName("rented_at") // Aggiungi questa linea
                    .HasColumnType("datetime2");
                
                entity.Property(e => e.DueDate)
                    .HasColumnName("due_date") // Aggiungi questa linea
                    .HasColumnType("datetime2");
                
                entity.Property(e => e.ReturnedAt)
                    .HasColumnName("returned_at") // Aggiungi questa linea
                    .HasColumnType("datetime2")
                    .IsRequired(false);
                
                entity.Property(e => e.UserId)
                    .HasColumnName("user_id");
                
                entity.Property(e => e.MovieId)
                    .HasColumnName("movie_id");
            });
        }
    }
}
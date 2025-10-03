using Microsoft.EntityFrameworkCore;
using RentalService.Models;

namespace RentalService.Data
{
    public class RentalDbContext : DbContext
    {
        public RentalDbContext(DbContextOptions<RentalDbContext> options) : base(options)
        {
        }

        public DbSet<Rental> Rentals { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configurazione della tabella rentals_db
            modelBuilder.Entity<Rental>(entity =>
            {
                entity.ToTable("rentals_db", "dbo");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId)
                    .HasColumnName("user_id")
                    .IsRequired()
                    .HasMaxLength(255);
                    
                entity.Property(e => e.MovieId)
                    .HasColumnName("movie_id")
                    .IsRequired();
                    
                entity.Property(e => e.RentedAt)
                    .HasColumnName("rented_at")
                    .IsRequired();
                    
                entity.Property(e => e.DueDate)
                    .HasColumnName("due_date")
                    .IsRequired();
                    
                entity.Property(e => e.ReturnedAt)
                    .HasColumnName("returned_at");
                    
                entity.Property(e => e.TotalPrice)
                    .HasColumnName("total_price")
                    .HasColumnType("decimal(10,2)")
                    .IsRequired();
                    
                entity.Property(e => e.Status)
                    .HasColumnName("status")
                    .IsRequired()
                    .HasMaxLength(50);
            });
        }
    }
}
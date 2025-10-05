using Microsoft.EntityFrameworkCore;
using ShoppingCartService.Models;

namespace ShoppingCartService.Data
{
    public class ShoppingCartDbContext : DbContext
    {
        public ShoppingCartDbContext(DbContextOptions<ShoppingCartDbContext> options)
            : base(options)
        {
        }

        public DbSet<ShoppingCart> ShoppingCarts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<UserRental> UserRentals { get; set; } // ✅ AGGIUNTO

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configurazione esistente
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart)
                .WithMany(c => c.Items)
                .HasForeignKey(ci => ci.CartId);

            // ✅ NUOVA Configurazione per UserRental
            modelBuilder.Entity<UserRental>(entity =>
            {
                entity.ToTable("UserRentals");
                entity.HasKey(e => e.Id);
                
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => new { e.UserId, e.MovieId });
                entity.HasIndex(e => e.ExpirationDate);
                
                entity.Property(e => e.MovieTitle)
                    .HasMaxLength(255)
                    .IsRequired();
                
                entity.Property(e => e.Price)
                    .HasPrecision(10, 2);
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
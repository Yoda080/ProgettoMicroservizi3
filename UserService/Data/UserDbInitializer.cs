using UserService.Data;
using UserService.Models;
using BCrypt.Net;

public static class UserDbInitializer
{
    public static void SeedData(UserDbContext context)
    {
        Console.WriteLine("Checking if database contains users...");
        if (context.Users.Any())
        {
            Console.WriteLine("Database already contains users. Seeding skipped.");
            return;
        }

        Console.WriteLine("Database is empty. Seeding new users...");

        var users = new User[]
        {
            // L'ID è omesso, verrà generato automaticamente dal database.
            new User
            {
                Username = "new_user",
                Email = "new.user@example.com",
                // Hashing della password prima di salvarla
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), 
                CreatedAt = DateTime.UtcNow // Imposta la data di creazione
            },
            new User
            {
                Username = "mariorossi",
                Email = "mario@email.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("supersegreta!"),
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Username = "testuser",
                Email = "test@email.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("testpassword"),
                CreatedAt = DateTime.UtcNow
            }
        };

        foreach (User u in users)
        {
            context.Users.Add(u);
        }

        context.SaveChanges();
        Console.WriteLine("Users seeded successfully!");
    }
}

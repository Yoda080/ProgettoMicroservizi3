using UserService.Models;

namespace UserService.Interfaces
{
    public interface IUserRepository
    {
        Task<User> GetByIdAsync(int id);
        Task<User> GetByEmailAsync(string email);
        Task<User> CreateAsync(User user);
        Task<bool> EmailExistsAsync(string email);
        Task SaveChangesAsync();
        
        // Aggiungi questo metodo se viene referenziato
        Task<bool> ExistsByEmailAsync(string email);
    }
}
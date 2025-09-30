using UserService.Dtos;

namespace UserService.Interfaces
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(RegisterDto registerDto);
        Task<string> LoginAsync(LoginDto loginDto);
        Task<bool> ValidateTokenAsync(string token);
    }
}
using System.Threading.Tasks;

namespace UserService.Services
{
    public interface IHttpClientService
    {
        Task<T> GetAsync<T>(string serviceName, string endpoint);
        Task<bool> ExistsAsync(string serviceName, string endpoint);
        Task<T> PostAsync<T>(string serviceName, string endpoint, object data);
        Task<bool> DeleteAsync(string serviceName, string endpoint);
    }
}
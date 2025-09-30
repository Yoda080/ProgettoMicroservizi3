using System.Threading.Tasks;

namespace RentalService.Services
{
    public interface IHttpClientService
    {
        Task<T> GetAsync<T>(string serviceName, string endpoint);
        Task<bool> ExistsAsync(string serviceName, string endpoint);
        Task<T> PostAsync<T>(string serviceName, string endpoint, object data);
    }
}
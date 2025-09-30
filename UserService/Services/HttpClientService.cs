using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace UserService.Services
{
    public class HttpClientService : IHttpClientService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public HttpClientService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<T> GetAsync<T>(string serviceName, string endpoint)
        {
            try
            {
                var baseUrl = _configuration[$"Services:{serviceName}"];
                var response = await _httpClient.GetAsync($"{baseUrl}/{endpoint}");
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new HttpRequestException($"Request to {serviceName} failed with status {response.StatusCode}");
                }
                
                return await response.Content.ReadFromJsonAsync<T>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling {serviceName}/{endpoint}: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> ExistsAsync(string serviceName, string endpoint)
        {
            try
            {
                var baseUrl = _configuration[$"Services:{serviceName}"];
                var response = await _httpClient.GetAsync($"{baseUrl}/{endpoint}");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<T> PostAsync<T>(string serviceName, string endpoint, object data)
        {
            try
            {
                var baseUrl = _configuration[$"Services:{serviceName}"];
                var response = await _httpClient.PostAsJsonAsync($"{baseUrl}/{endpoint}", data);
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new HttpRequestException($"Request to {serviceName} failed with status {response.StatusCode}");
                }
                
                return await response.Content.ReadFromJsonAsync<T>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling {serviceName}/{endpoint}: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string serviceName, string endpoint)
        {
            try
            {
                var baseUrl = _configuration[$"Services:{serviceName}"];
                var response = await _httpClient.DeleteAsync($"{baseUrl}/{endpoint}");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
    }
}
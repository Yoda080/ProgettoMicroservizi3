using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;

namespace RentalService.Services
{
    public class HttpClientService : IHttpClientService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public HttpClientService(HttpClient httpClient, IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        private void AddAuthorizationHeader()
        {
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
            if (!string.IsNullOrEmpty(token))
            {
                _httpClient.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(token);
            }
        }

        public async Task<T> GetAsync<T>(string serviceName, string endpoint)
        {
            try
            {
                AddAuthorizationHeader();
                var baseUrl = _configuration[$"Services:{serviceName}"];
                var response = await _httpClient.GetAsync($"{baseUrl}/{endpoint}");
                
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<T>() ?? default!;
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
                AddAuthorizationHeader();
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
                AddAuthorizationHeader();
                var baseUrl = _configuration[$"Services:{serviceName}"];
                var response = await _httpClient.PostAsJsonAsync($"{baseUrl}/{endpoint}", data);
                
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<T>() ?? default!;
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
                AddAuthorizationHeader();
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
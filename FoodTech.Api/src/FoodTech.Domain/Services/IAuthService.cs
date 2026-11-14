using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;

namespace FoodTech.Domain.Services;

public interface IAuthService
{
    Task<(string accessToken, string refreshToken, User user)> RegisterAsync(
        string email,
        string password,
        string name,
        UserRole role,
        string? phone = null,
        CancellationToken ct = default);

    Task<(string accessToken, string refreshToken, User user)> LoginAsync(
        string email,
        string password,
        CancellationToken ct = default);

    Task<(string accessToken, string refreshToken)> RefreshTokenAsync(
        string refreshToken,
        CancellationToken ct = default);

    Task<User?> GetCurrentUserAsync(string userId, CancellationToken ct = default);
    Task<bool> RevokeRefreshTokenAsync(string userId, CancellationToken ct = default);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}
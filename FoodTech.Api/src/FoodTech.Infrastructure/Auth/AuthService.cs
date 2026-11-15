using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Domain.Repositories;
using FoodTech.Domain.Services;
using FoodTech.Infrastructure.Auth;

namespace FoodTech.Infrastructure.Auth;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly JwtSettings _jwtSettings;

    public AuthService(IUserRepository userRepository, IOptions<JwtSettings> jwtSettings)
    {
        _userRepository = userRepository;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<(string accessToken, string refreshToken, User user)> RegisterAsync(
        string email,
        string password,
        string name,
        UserRole role,
        string? phone = null,
        CancellationToken ct = default)
    {
        var existingUser = await _userRepository.GetByEmailAsync(email, ct);
        if (existingUser != null)
        {
            throw new InvalidOperationException("Email already registered");
        }

        if (!string.IsNullOrEmpty(phone))
        {
            var existingPhone = await _userRepository.GetByPhoneAsync(phone, ct);
            if (existingPhone != null)
            {
                throw new InvalidOperationException("Phone number already registered");
            }
        }

        var passwordHash = HashPassword(password);
        var user = new User
        {
            Email = email.ToLowerInvariant(),
            PasswordHash = passwordHash,
            Role = role,
            Name = name.Trim(),
            Phone = phone?.Trim(),
            IsActive = true
        };

        user = await _userRepository.CreateAsync(user, ct);

        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();

        // Store refresh token hash in user (in production, use a separate table)
        user.PasswordHash += $"|{HashPassword(refreshToken)}"; // Simple approach for demo
        await _userRepository.UpdateAsync(user, ct);

        return (accessToken, refreshToken, user);
    }

    public async Task<(string accessToken, string refreshToken, User user)> LoginAsync(
        string email,
        string password,
        CancellationToken ct = default)
    {
        var user = await _userRepository.GetByEmailAsync(email.ToLowerInvariant(), ct);
        if (user == null || !VerifyPassword(password, user.PasswordHash.Split('|')[0]))
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Account is deactivated");
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, ct);

        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();

        // Update refresh token hash
        var passwordHash = user.PasswordHash.Split('|')[0];
        user.PasswordHash = $"{passwordHash}|{HashPassword(refreshToken)}";
        await _userRepository.UpdateAsync(user, ct);

        return (accessToken, refreshToken, user);
    }

    public async Task<(string accessToken, string refreshToken)> RefreshTokenAsync(
        string refreshToken,
        CancellationToken ct = default)
    {
        // Find user by refresh token hash
        // In a real implementation, you'd have a separate refresh token table
        // For now, we check all users (not efficient but works for demo)
        var users = await _userRepository.GetAllAsync(ct);

        User? user = null;
        foreach (var u in users)
        {
            var parts = u.PasswordHash.Split('|');
            if (parts.Length >= 2 && !string.IsNullOrEmpty(parts[1]) && VerifyPassword(refreshToken, parts[1]))
            {
                user = u;
                break;
            }
        }

        if (user == null || !user.IsActive)
        {
            throw new UnauthorizedAccessException("Invalid refresh token");
        }

        var newAccessToken = GenerateAccessToken(user);
        var newRefreshToken = GenerateRefreshToken();

        // Update refresh token hash
        var passwordHash = user.PasswordHash.Split('|')[0];
        user.PasswordHash = $"{passwordHash}|{HashPassword(newRefreshToken)}";
        await _userRepository.UpdateAsync(user, ct);

        return (newAccessToken, newRefreshToken);
    }

    public async Task<User?> GetCurrentUserAsync(string userId, CancellationToken ct = default)
    {
        return await _userRepository.GetByIdAsync(userId, ct);
    }

    public async Task<bool> RevokeRefreshTokenAsync(string userId, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user == null) return false;

        var passwordHash = user.PasswordHash.Split('|')[0];
        user.PasswordHash = $"{passwordHash}|"; // Clear refresh token
        await _userRepository.UpdateAsync(user, ct);
        return true;
    }

    public async Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user == null || !user.IsActive)
        {
            return false;
        }

        var passwordHash = user.PasswordHash.Split('|')[0];
        if (!VerifyPassword(currentPassword, passwordHash))
        {
            return false;
        }

        var newPasswordHash = HashPassword(newPassword);
        user.PasswordHash = $"{newPasswordHash}|{user.PasswordHash.Split('|').ElementAtOrDefault(1) ?? string.Empty}";
        await _userRepository.UpdateAsync(user, ct);
        return true;
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, 12);
    }

    public bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    private string GenerateAccessToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString().ToLowerInvariant()),
            new Claim("vendorProfileId", user.VendorProfileId ?? string.Empty)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }
}
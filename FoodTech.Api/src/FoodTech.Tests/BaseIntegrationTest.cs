using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Xunit;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Infrastructure.Auth;
using FoodTech.Infrastructure.Data;
using FoodTech.Tests.Fixtures;

namespace FoodTech.Tests;

public abstract class BaseIntegrationTest : IClassFixture<CustomWebApplicationFactory>
{
    protected readonly CustomWebApplicationFactory Factory;
    protected readonly HttpClient Client;
    protected readonly AppDbContext Context;

    protected BaseIntegrationTest(CustomWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();

        var scope = factory.Services.CreateScope();
        Context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    }

    protected async Task<User> CreateTestUserAsync(
        string email = "test@example.com",
        string password = "Test@123",
        UserRole role = UserRole.Employee,
        string? name = null,
        string? phone = null)
    {
        var user = new User
        {
            Email = email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password, 12),
            Role = role,
            Name = name ?? "Test User",
            Phone = phone,
            IsActive = true
        };

        Context.Users.Add(user);
        await Context.SaveChangesAsync();
        return user;
    }

    protected async Task<VendorProfile> CreateTestVendorAsync(
        string userId,
        string businessName = "Test Vendor",
        string gstNumber = "GST123456789")
    {
        var vendor = new VendorProfile
        {
            UserId = userId,
            BusinessName = businessName,
            GstNumber = gstNumber,
            Address = new FoodTech.Domain.Entities.Address
            {
                Street = "123 Test St",
                City = "Test City",
                State = "TS",
                Pincode = "12345"
            },
            OperatingHours = new FoodTech.Domain.Entities.OperatingHours
            {
                Open = "09:00",
                Close = "22:00"
            },
            IsApproved = true
        };

        Context.VendorProfiles.Add(vendor);
        await Context.SaveChangesAsync();
        return vendor;
    }

    protected async Task<MenuItem> CreateTestMenuItemAsync(
        string vendorId,
        string name = "Test Item",
        decimal price = 100,
        FoodTech.Domain.Enums.Category category = FoodTech.Domain.Enums.Category.Lunch)
    {
        var item = new MenuItem
        {
            VendorId = vendorId,
            Name = name,
            Description = "Test description",
            Price = (long)(price * 100), // Store in paise
            Category = category,
            DietType = FoodTech.Domain.Enums.DietType.Veg,
            PrepTimeMinutes = 15,
            IsAvailable = true
        };

        Context.MenuItems.Add(item);
        await Context.SaveChangesAsync();
        return item;
    }

    protected async Task<Order> CreateTestOrderAsync(
        string employeeId,
        string vendorId,
        MenuItem[] items,
        FoodTech.Domain.Enums.PaymentMethod paymentMethod = FoodTech.Domain.Enums.PaymentMethod.Upi)
    {
        var orderItems = items.Select(m => new OrderItem
        {
            MenuItemId = m.Id,
            Name = m.Name,
            Price = m.Price,
            Quantity = 1,
            DietType = m.DietType
        }).ToArray();

        long subtotal = orderItems.Sum(oi => oi.Price * oi.Quantity);
        long taxAmount = (long)Math.Round(subtotal * 0.05m);
        long total = subtotal + taxAmount;

        var order = new Order
        {
            EmployeeId = employeeId,
            VendorId = vendorId,
            Items = orderItems,
            Status = OrderStatus.Pending,
            Subtotal = subtotal,
            TaxAmount = taxAmount,
            Total = total,
            PaymentMethod = paymentMethod,
            PaymentStatus = PaymentStatus.Pending,
            OrderNumber = $"ORD-TEST-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}"
        };

        Context.Orders.Add(order);
        await Context.SaveChangesAsync();
        return order;
    }

    protected string GenerateJwtToken(User user, string? vendorProfileId = null)
    {
        var jwtSettings = new JwtSettings
        {
            Secret = "test-secret-key-for-testing-minimum-32-characters-long",
            Issuer = "foodtech-test",
            Audience = "foodtech-test",
            AccessTokenExpiryMinutes = 60
        };

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString().ToLowerInvariant()),
            new Claim("vendorProfileId", vendorProfileId ?? user.VendorProfileId ?? string.Empty)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings.Issuer,
            audience: jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(jwtSettings.AccessTokenExpiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    protected void SetAuthHeader(string token)
    {
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    protected void ClearAuthHeader()
    {
        Client.DefaultRequestHeaders.Authorization = null;
    }

    protected async Task<T?> DeserializeResponse<T>(HttpResponseMessage response)
    {
        var content = await response.Content.ReadAsStringAsync();
        return System.Text.Json.JsonSerializer.Deserialize<T>(content, new System.Text.Json.JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }
}
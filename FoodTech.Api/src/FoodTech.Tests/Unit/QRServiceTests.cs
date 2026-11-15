using FluentAssertions;
using FoodTech.Domain.Entities;
using FoodTech.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace FoodTech.Tests.Unit;

public class QRServiceTests
{
    private readonly QRService _qrService;
    private const string SecretKey = "test-qr-secret-key";

    public QRServiceTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["QR:SecretKey"] = SecretKey
            })
            .Build();

        _qrService = new QRService(config);
    }

    [Fact]
    public void GenerateQrToken_ValidOrder_ShouldReturnTokenWithHash()
    {
        // Arrange
        var order = new Order
        {
            Id = "order-123",
            VendorId = "vendor-456",
            OrderNumber = "ORD-001"
        };

        // Act
        var token = _qrService.GenerateQrToken(order);

        // Assert
        token.Should().NotBeNullOrEmpty();
        token.Should().Contain("."); // base64token.base64hash format

        var parts = token.Split('.');
        parts.Should().HaveCount(2);

        // Verify token is valid base64
        var tokenBytes = Convert.FromBase64String(parts[0]);
        var hashBytes = Convert.FromBase64String(parts[1]);

        tokenBytes.Should().NotBeEmpty();
        hashBytes.Length.Should().Be(32); // SHA256 = 32 bytes
    }

    [Fact]
    public void VerifyQrToken_ValidToken_ShouldReturnTrueAndExtractData()
    {
        // Arrange
        var order = new Order
        {
            Id = "order-123",
            VendorId = "vendor-456",
            OrderNumber = "ORD-001"
        };

        var token = _qrService.GenerateQrToken(order);

        // Act
        var result = _qrService.VerifyQrToken(token, out var orderId, out var vendorId);

        // Assert
        result.Should().BeTrue();
        orderId.Should().Be("order-123");
        vendorId.Should().Be("vendor-456");
    }

    [Fact]
    public void VerifyQrToken_ExpiredToken_ShouldReturnFalse()
    {
        // Arrange - create a token with past expiry
        var expiredPayload = new
        {
            orderId = "order-123",
            vendorId = "vendor-456",
            orderNumber = "ORD-001",
            timestamp = DateTimeOffset.UtcNow.AddHours(-1).ToUnixTimeSeconds(),
            expiry = DateTimeOffset.UtcNow.AddMinutes(-10).ToUnixTimeSeconds() // Expired 10 min ago
        };

        var json = System.Text.Json.JsonSerializer.Serialize(expiredPayload);
        var tokenBytes = System.Text.Encoding.UTF8.GetBytes(json);
        var base64Token = Convert.ToBase64String(tokenBytes);

        using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(SecretKey));
        var hash = hmac.ComputeHash(tokenBytes);
        var base64Hash = Convert.ToBase64String(hash);

        var expiredToken = $"{base64Token}.{base64Hash}";

        // Act
        var result = _qrService.VerifyQrToken(expiredToken, out _, out _);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void VerifyQrToken_InvalidHash_ShouldReturnFalse()
    {
        // Arrange
        var order = new Order
        {
            Id = "order-123",
            VendorId = "vendor-456",
            OrderNumber = "ORD-001"
        };

        var token = _qrService.GenerateQrToken(order);
        var parts = token.Split('.');

        // Tamper with hash
        var tamperedToken = $"{parts[0]}.{parts[1]}x";

        // Act
        var result = _qrService.VerifyQrToken(tamperedToken, out _, out _);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void VerifyQrToken_InvalidFormat_ShouldReturnFalse()
    {
        // Act
        var result = _qrService.VerifyQrToken("invalid-token", out _, out _);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void VerifyQrToken_WrongSecret_ShouldReturnFalse()
    {
        // Arrange - generate with one secret
        var config1 = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["QR:SecretKey"] = "secret1" })
            .Build();
        var qrService1 = new QRService(config1);

        var order = new Order { Id = "order-123", VendorId = "vendor-456", OrderNumber = "ORD-001" };
        var token = qrService1.GenerateQrToken(order);

        // Act - verify with different secret
        var config2 = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["QR:SecretKey"] = "secret2" })
            .Build();
        var qrService2 = new QRService(config2);

        var result = qrService2.VerifyQrToken(token, out _, out _);

        // Assert
        result.Should().BeFalse();
    }
}
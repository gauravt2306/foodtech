using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Services;

namespace FoodTech.Infrastructure.Services;

public class QRService : IQRService
{
    private readonly string _secretKey;

    public QRService(IConfiguration configuration)
    {
        _secretKey = configuration["QR:SecretKey"] ?? "foodtech-qr-secret-key-change-in-production";
    }

    public string GenerateQrToken(Order order)
    {
        var payload = new
        {
            orderId = order.Id,
            vendorId = order.VendorId,
            orderNumber = order.OrderNumber,
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            expiry = DateTimeOffset.UtcNow.AddMinutes(30).ToUnixTimeSeconds()
        };

        var json = System.Text.Json.JsonSerializer.Serialize(payload);
        var tokenBytes = Encoding.UTF8.GetBytes(json);
        var base64Token = Convert.ToBase64String(tokenBytes);

        // Generate HMAC
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_secretKey));
        var hash = hmac.ComputeHash(tokenBytes);
        var base64Hash = Convert.ToBase64String(hash);

        // Combine token and hash with a delimiter
        return $"{base64Token}.{base64Hash}";
    }

    public bool VerifyQrToken(string token, out string orderId, out string vendorId)
    {
        orderId = string.Empty;
        vendorId = string.Empty;

        try
        {
            var parts = token.Split('.');
            if (parts.Length != 2) return false;

            var base64Token = parts[0];
            var base64Hash = parts[1];

            var tokenBytes = Convert.FromBase64String(base64Token);

            // Verify HMAC
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_secretKey));
            var expectedHash = hmac.ComputeHash(tokenBytes);
            var providedHash = Convert.FromBase64String(base64Hash);

            if (!CryptographicOperations.FixedTimeEquals(expectedHash, providedHash))
            {
                return false;
            }

            // Parse payload
            var json = Encoding.UTF8.GetString(tokenBytes);
            var payload = System.Text.Json.JsonSerializer.Deserialize<QrPayload>(json);

            if (payload == null) return false;

            // Check expiry
            if (payload.Expiry < DateTimeOffset.UtcNow.ToUnixTimeSeconds())
            {
                return false;
            }

            orderId = payload.OrderId;
            vendorId = payload.VendorId;
            return true;
        }
        catch
        {
            return false;
        }
    }

    private class QrPayload
    {
        public string OrderId { get; set; } = string.Empty;
        public string VendorId { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
        public long Timestamp { get; set; }
        public long Expiry { get; set; }
    }
}
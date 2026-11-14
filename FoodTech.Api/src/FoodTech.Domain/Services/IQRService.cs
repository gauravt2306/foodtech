using FoodTech.Domain.Entities;

namespace FoodTech.Domain.Services;

public interface IQRService
{
    string GenerateQrToken(Order order);
    bool VerifyQrToken(string token, out string orderId, out string vendorId);
}
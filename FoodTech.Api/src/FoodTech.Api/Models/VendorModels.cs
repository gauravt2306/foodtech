using FoodTech.Domain.Enums;

namespace FoodTech.Api.Models;

public record UpdateVendorProfileRequest(
    string BusinessName,
    string GstNumber,
    AddressDto Address,
    OperatingHoursDto OperatingHours
);

public record CreateMenuItemRequest(
    string Name,
    string Description,
    long Price, // in paise
    Category Category,
    DietType DietType,
    string? ImageUrl,
    int PrepTimeMinutes,
    string[] Tags
);

public record UpdateMenuItemRequest(
    string? Name,
    string? Description,
    long? Price,
    Category? Category,
    DietType? DietType,
    string? ImageUrl,
    bool? IsAvailable,
    int? PrepTimeMinutes,
    string[]? Tags
);

public record MenuItemDto(
    string Id,
    string VendorId,
    string Name,
    string Description,
    long Price,
    Category Category,
    DietType DietType,
    string? ImageUrl,
    bool IsAvailable,
    int PrepTimeMinutes,
    string[] Tags,
    DateTime CreatedAt
);

public record OrderDto(
    string Id,
    string OrderNumber,
    string EmployeeId,
    string VendorId,
    OrderItemDto[] Items,
    OrderStatus Status,
    long Subtotal,
    long Tax,
    long Total,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    string? PaymentId,
    string QrCodeData,
    DateTime? HandoffAt,
    string? HandoffBy,
    string? SpecialInstructions,
    DateTime? PickupTime,
    DateTime CreatedAt
);

public record OrderItemDto(
    string MenuItemId,
    string Name,
    long Price,
    int Quantity,
    DietType DietType
);

public record UpdateOrderStatusRequest(
    OrderStatus Status
);

public record HandoffOrderRequest(
    string QrToken
);

public record VendorOrdersResponse(
    OrderDto[] Pending,
    OrderDto[] Confirmed,
    OrderDto[] Preparing,
    OrderDto[] Ready,
    OrderDto[] Completed,
    OrderDto[] Cancelled
);
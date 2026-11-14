using FoodTech.Domain.Enums;

namespace FoodTech.Api.Models;

public record VendorListItemDto(
    string Id,
    string BusinessName,
    string GstNumber,
    AddressDto Address,
    OperatingHoursDto OperatingHours,
    bool IsApproved,
    double Rating,
    long TotalOrders,
    int MenuItemCount
);

public record EmployeeVendorMenuDto(
    string VendorId,
    string BusinessName,
    MenuItemDto[] MenuItems
);

public record CreateOrderRequest(
    string VendorId,
    OrderItemRequest[] Items,
    PaymentMethod PaymentMethod,
    string? SpecialInstructions,
    DateTime? PickupTime
);

public record OrderItemRequest(
    string MenuItemId,
    int Quantity
);

public record CreateOrderResponse(
    string OrderId,
    string OrderNumber,
    long Subtotal,
    long Tax,
    long Total,
    string QrCodeData
);

public record PayOrderRequest(
    string PaymentId,
    string? UpiTransactionId,
    string? UpiVpa,
    string? PayerName
);

public record UpiPaymentInitiateRequest(
    string OrderId,
    string UpiVpa
);

public record UpiPaymentInitiateResponse(
    string UpiDeepLink,
    string OrderId,
    long Amount,
    string TransactionRef
);

public record UpiPaymentCallbackRequest(
    string TransactionRef,
    string UpiTransactionId,
    string Status,
    string? PayerName,
    string? PayerVpa
);

public record QrCodeResponse(
    string QrToken
);

public record EmployeeOrderDto(
    string Id,
    string OrderNumber,
    string VendorId,
    string VendorName,
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
    string? SpecialInstructions,
    DateTime? PickupTime,
    DateTime CreatedAt
);
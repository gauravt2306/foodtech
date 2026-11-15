using FoodTech.Domain.Enums;

namespace FoodTech.Domain.Entities;

public class Order
{
    public string Id { get; set; } = default!;

    public string OrderNumber { get; set; } = default!; // "ORD-YYYYMMDD-XXXX"

    public string EmployeeId { get; set; } = default!;

    public string VendorId { get; set; } = default!;

    public OrderItem[] Items { get; set; } = Array.Empty<OrderItem>();

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public long Subtotal { get; set; } // in paise

    public long TaxAmount { get; set; } // in paise

    public long DeliveryFee { get; set; } // in paise

    public long Total { get; set; } // in paise

    public PaymentMethod PaymentMethod { get; set; }

    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

    public string? PaymentId { get; set; }

    public string QrCodeData { get; set; } = string.Empty; // base64 encoded token for handoff

    public DateTime? HandoffAt { get; set; }

    public string? HandoffBy { get; set; }

    public string? SpecialInstructions { get; set; }

    public string? Notes { get; set; }

    public DateTime? PickupTime { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
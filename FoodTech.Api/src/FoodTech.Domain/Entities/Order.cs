using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using FoodTech.Domain.Enums;

namespace FoodTech.Domain.Entities;

public class Order
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("orderNumber")]
    [BsonRequired]
    public string OrderNumber { get; set; } = string.Empty; // "ORD-YYYYMMDD-XXXX"

    [BsonElement("employeeId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public string EmployeeId { get; set; } = string.Empty;

    [BsonElement("vendorId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public string VendorId { get; set; } = string.Empty;

    [BsonElement("items")]
    [BsonRequired]
    public OrderItem[] Items { get; set; } = Array.Empty<OrderItem>();

    [BsonElement("status")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    [BsonElement("subtotal")]
    [BsonRequired]
    public long Subtotal { get; set; } // in paise

    [BsonElement("tax")]
    [BsonRequired]
    public long Tax { get; set; } // in paise

    [BsonElement("total")]
    [BsonRequired]
    public long Total { get; set; } // in paise

    [BsonElement("paymentMethod")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public PaymentMethod PaymentMethod { get; set; }

    [BsonElement("paymentStatus")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

    [BsonElement("paymentId")]
    public string? PaymentId { get; set; }

    [BsonElement("qrCodeData")]
    [BsonRequired]
    public string QrCodeData { get; set; } = string.Empty; // base64 encoded token for handoff

    [BsonElement("handoffAt")]
    public DateTime? HandoffAt { get; set; }

    [BsonElement("handoffBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? HandoffBy { get; set; }

    [BsonElement("specialInstructions")]
    public string? SpecialInstructions { get; set; }

    [BsonElement("pickupTime")]
    public DateTime? PickupTime { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
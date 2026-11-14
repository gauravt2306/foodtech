using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using FoodTech.Domain.Enums;

namespace FoodTech.Domain.Entities;

public class VendorProfile
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("userId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("businessName")]
    [BsonRequired]
    public string BusinessName { get; set; } = string.Empty;

    [BsonElement("gstNumber")]
    [BsonRequired]
    public string GstNumber { get; set; } = string.Empty;

    [BsonElement("address")]
    [BsonRequired]
    public Address Address { get; set; } = new();

    [BsonElement("operatingHours")]
    [BsonRequired]
    public OperatingHours OperatingHours { get; set; } = new();

    [BsonElement("isApproved")]
    public bool IsApproved { get; set; } = false;

    [BsonElement("approvedBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ApprovedBy { get; set; }

    [BsonElement("approvedAt")]
    public DateTime? ApprovedAt { get; set; }

    [BsonElement("rating")]
    public double Rating { get; set; } = 0;

    [BsonElement("totalOrders")]
    public long TotalOrders { get; set; } = 0;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
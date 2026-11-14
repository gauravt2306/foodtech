using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using FoodTech.Domain.Enums;

namespace FoodTech.Domain.Entities;

public class MenuItem
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("vendorId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public string VendorId { get; set; } = string.Empty;

    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    [BsonElement("description")]
    [BsonRequired]
    public string Description { get; set; } = string.Empty;

    [BsonElement("price")]
    [BsonRequired]
    public long Price { get; set; } // in paise (integer)

    [BsonElement("category")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public Category Category { get; set; }

    [BsonElement("dietType")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public DietType DietType { get; set; }

    [BsonElement("imageUrl")]
    public string? ImageUrl { get; set; }

    [BsonElement("isAvailable")]
    public bool IsAvailable { get; set; } = true;

    [BsonElement("prepTimeMinutes")]
    [BsonRequired]
    public int PrepTimeMinutes { get; set; } = 15;

    [BsonElement("tags")]
    public string[] Tags { get; set; } = Array.Empty<string>();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
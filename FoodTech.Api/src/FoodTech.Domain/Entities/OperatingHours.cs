using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FoodTech.Domain.Entities;

public class OperatingHours
{
    [BsonElement("open")]
    public string Open { get; set; } = string.Empty; // "09:00"

    [BsonElement("close")]
    public string Close { get; set; } = string.Empty; // "22:00"
}
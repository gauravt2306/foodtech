using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using FoodTech.Domain.Enums;

namespace FoodTech.Domain.Entities;

public class OrderItem
{
    [BsonElement("menuItemId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public string MenuItemId { get; set; } = string.Empty;

    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    [BsonElement("price")]
    [BsonRequired]
    public long Price { get; set; } // in paise (snapshot at order time)

    [BsonElement("quantity")]
    [BsonRequired]
    public int Quantity { get; set; }

    [BsonElement("dietType")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public DietType DietType { get; set; }
}
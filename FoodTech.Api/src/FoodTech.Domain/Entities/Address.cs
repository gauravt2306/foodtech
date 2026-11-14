using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FoodTech.Domain.Entities;

public class Address
{
    [BsonElement("street")]
    public string Street { get; set; } = string.Empty;

    [BsonElement("city")]
    public string City { get; set; } = string.Empty;

    [BsonElement("state")]
    public string State { get; set; } = string.Empty;

    [BsonElement("pincode")]
    public string Pincode { get; set; } = string.Empty;
}
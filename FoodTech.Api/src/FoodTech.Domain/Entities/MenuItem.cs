using FoodTech.Domain.Enums;

namespace FoodTech.Domain.Entities;

public class MenuItem
{
    public string Id { get; set; } = string.Empty;

    public string VendorId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public long Price { get; set; } // in paise (integer)

    public Category Category { get; set; }

    public DietType DietType { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsAvailable { get; set; } = true;

    public int PrepTimeMinutes { get; set; } = 15;

    public string[] Tags { get; set; } = Array.Empty<string>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
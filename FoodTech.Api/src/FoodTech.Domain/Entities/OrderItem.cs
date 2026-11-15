using FoodTech.Domain.Enums;

namespace FoodTech.Domain.Entities;

public class OrderItem
{
    public string MenuItemId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public long Price { get; set; } // in paise (snapshot at order time)

    public int Quantity { get; set; }

    public DietType DietType { get; set; }
}
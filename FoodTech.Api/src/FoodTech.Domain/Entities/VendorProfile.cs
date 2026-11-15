using FoodTech.Domain.Enums;

namespace FoodTech.Domain.Entities;

public class VendorProfile
{
    public string Id { get; set; } = default!;

    public string UserId { get; set; } = default!;

    public string BusinessName { get; set; } = string.Empty;

    public string GstNumber { get; set; } = string.Empty;

    public string? Description { get; set; }

    public Address Address { get; set; } = new();

    public OperatingHours OperatingHours { get; set; } = new();

    public string? ImageUrl { get; set; }

    public bool IsApproved { get; set; } = false;

    public string? ApprovedBy { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public double Rating { get; set; } = 0;

    public long TotalOrders { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
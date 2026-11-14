using FoodTech.Domain.Enums;

namespace FoodTech.Api.Models;

public record SuperAdminVendorDto(
    string Id,
    string UserId,
    string Email,
    string Name,
    string BusinessName,
    string GstNumber,
    bool IsApproved,
    string? ApprovedBy,
    DateTime? ApprovedAt,
    double Rating,
    long TotalOrders,
    DateTime CreatedAt
);

public record ApproveVendorRequest(
    bool Approve
);

public record SuperAdminUserDto(
    string Id,
    string Email,
    string Name,
    UserRole Role,
    string? Phone,
    string? AvatarUrl,
    bool IsActive,
    string? VendorProfileId,
    DateTime? LastLoginAt,
    DateTime CreatedAt
);

public record UpdateUserStatusRequest(
    bool IsActive
);

public record DashboardAnalyticsDto(
    long TotalOrders,
    long PaidOrders,
    decimal TotalRevenue,
    long TotalVendors
);

public record OrderAnalyticsDto(
    DailyOrderStat[] DailyStats
);

public record DailyOrderStat(
    string Date,
    long TotalOrders,
    decimal TotalRevenue,
    Dictionary<string, int> ByStatus
);

public record RevenueAnalyticsDto(
    DailyRevenueStat[] DailyRevenue,
    decimal TotalRevenue,
    long TotalOrders,
    decimal AverageOrderValue
);

public record DailyRevenueStat(
    string Date,
    decimal Revenue,
    long Orders
);

public record VendorPerformanceDto(
    VendorPerformanceItem[] Vendors
);

public record VendorPerformanceItem(
    string VendorId,
    string BusinessName,
    long TotalOrders,
    decimal TotalRevenue,
    double Rating
);
using FoodTech.Domain.Enums;

namespace FoodTech.Domain.Services;

public interface IAnalyticsService
{
    Task<object> GetDashboardStatsAsync(string? vendorId = null, CancellationToken ct = default);
    Task<object> GetOrderAnalyticsAsync(string? vendorId = null, DateTime? from = null, DateTime? to = null, CancellationToken ct = default);
    Task<object> GetRevenueAnalyticsAsync(string? vendorId = null, DateTime? from = null, DateTime? to = null, CancellationToken ct = default);
    Task<object> GetVendorPerformanceAsync(CancellationToken ct = default);
}
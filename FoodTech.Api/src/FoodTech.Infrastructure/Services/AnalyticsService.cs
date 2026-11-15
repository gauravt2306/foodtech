using Microsoft.EntityFrameworkCore;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Domain.Repositories;
using FoodTech.Domain.Services;
using FoodTech.Infrastructure.Data;

namespace FoodTech.Infrastructure.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly AppDbContext _context;

    public AnalyticsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<object> GetDashboardStatsAsync(string? vendorId = null, CancellationToken ct = default)
    {
        var ordersQuery = _context.Orders.AsQueryable();
        if (vendorId != null)
        {
            ordersQuery = ordersQuery.Where(o => o.VendorId == vendorId);
        }

        var totalOrders = await ordersQuery.LongCountAsync(ct);

        var paidOrders = await ordersQuery
            .Where(o => o.PaymentStatus == PaymentStatus.Paid)
            .LongCountAsync(ct);

        var totalRevenue = await ordersQuery
            .Where(o => o.PaymentStatus == PaymentStatus.Paid)
            .SumAsync(o => (decimal?)o.Total, ct) ?? 0m;

        var totalVendors = await _context.VendorProfiles
            .Where(v => v.IsApproved)
            .LongCountAsync(ct);

        return new
        {
            TotalOrders = totalOrders,
            PaidOrders = paidOrders,
            TotalRevenue = totalRevenue / 100m, // Convert paise to rupees
            TotalVendors = totalVendors
        };
    }

    public async Task<object> GetOrderAnalyticsAsync(string? vendorId = null, DateTime? from = null, DateTime? to = null, CancellationToken ct = default)
    {
        var query = _context.Orders.AsQueryable();

        if (vendorId != null)
        {
            query = query.Where(o => o.VendorId == vendorId);
        }

        if (from.HasValue)
        {
            query = query.Where(o => o.CreatedAt >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(o => o.CreatedAt <= to.Value);
        }

        var results = await query
            .GroupBy(o => new { Date = o.CreatedAt.Date, o.Status })
            .Select(g => new
            {
                Date = g.Key.Date,
                Status = g.Key.Status,
                Count = g.Count(),
                Revenue = g.Sum(x => (decimal?)x.Total) ?? 0m
            })
            .OrderBy(x => x.Date)
            .ToListAsync(ct);

        var dailyStats = results
            .GroupBy(r => r.Date.ToString("yyyy-MM-dd"))
            .Select(g => new
            {
                Date = g.Key,
                TotalOrders = g.Sum(x => x.Count),
                TotalRevenue = g.Sum(x => x.Revenue) / 100m,
                ByStatus = g.ToDictionary(
                    x => x.Status.ToString(),
                    x => x.Count)
            })
            .OrderBy(x => x.Date)
            .ToList();

        return new { DailyStats = dailyStats };
    }

    public async Task<object> GetRevenueAnalyticsAsync(string? vendorId = null, DateTime? from = null, DateTime? to = null, CancellationToken ct = default)
    {
        var query = _context.Orders
            .Where(o => o.PaymentStatus == PaymentStatus.Paid);

        if (vendorId != null)
        {
            query = query.Where(o => o.VendorId == vendorId);
        }

        if (from.HasValue)
        {
            query = query.Where(o => o.CreatedAt >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(o => o.CreatedAt <= to.Value);
        }

        var results = await query
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new
            {
                Date = g.Key,
                Revenue = g.Sum(x => (decimal?)x.Total) ?? 0m,
                Orders = g.Count()
            })
            .OrderBy(x => x.Date)
            .ToListAsync(ct);

        var dailyRevenue = results.Select(r => new
        {
            Date = r.Date.ToString("yyyy-MM-dd"),
            Revenue = r.Revenue / 100m,
            Orders = r.Orders
        }).ToList();

        var totalRevenue = dailyRevenue.Sum(d => d.Revenue);
        var totalOrders = dailyRevenue.Sum(d => d.Orders);

        return new
        {
            DailyRevenue = dailyRevenue,
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            AverageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
        };
    }

    public async Task<object> GetVendorPerformanceAsync(CancellationToken ct = default)
    {
        var results = await _context.Orders
            .Where(o => o.PaymentStatus == PaymentStatus.Paid)
            .GroupBy(o => o.VendorId)
            .Select(g => new
            {
                VendorId = g.Key,
                TotalOrders = g.Count(),
                TotalRevenue = g.Sum(x => (decimal?)x.Total) ?? 0m
            })
            .OrderByDescending(x => x.TotalRevenue)
            .ToListAsync(ct);

        var vendorIds = results.Select(r => r.VendorId).ToList();
        var vendors = await _context.VendorProfiles
            .Where(v => vendorIds.Contains(v.Id))
            .ToListAsync(ct);
        var vendorDict = vendors.ToDictionary(v => v.Id);

        var performance = results.Select(r =>
        {
            vendorDict.TryGetValue(r.VendorId, out var vendor);
            return new
            {
                VendorId = r.VendorId,
                BusinessName = vendor?.BusinessName ?? "Unknown",
                TotalOrders = r.TotalOrders,
                TotalRevenue = r.TotalRevenue / 100m,
                Rating = vendor?.Rating ?? 0
            };
        }).ToList();

        return new { Vendors = performance };
    }
}
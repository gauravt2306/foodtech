using MongoDB.Driver;
using MongoDB.Bson;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Domain.Repositories;
using FoodTech.Domain.Services;
using FoodTech.Infrastructure.Data;

namespace FoodTech.Infrastructure.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly IMongoCollection<Order> _orders;
    private readonly IMongoCollection<VendorProfile> _vendorProfiles;
    private readonly IMongoCollection<MenuItem> _menuItems;
    private readonly IMongoCollection<User> _users;

    public AnalyticsService(MongoDbContext context)
    {
        _orders = context.Orders;
        _vendorProfiles = context.VendorProfiles;
        _menuItems = context.MenuItems;
        _users = context.Users;
    }

    public async Task<object> GetDashboardStatsAsync(string? vendorId = null, CancellationToken ct = default)
    {
        var filter = vendorId != null
            ? Builders<Order>.Filter.Eq(o => o.VendorId, vendorId)
            : FilterDefinition<Order>.Empty;

        var totalOrders = await _orders.CountDocumentsAsync(filter, cancellationToken: ct);

        var paidFilter = filter & Builders<Order>.Filter.Eq(o => o.PaymentStatus, PaymentStatus.Paid);
        var paidOrders = await _orders.CountDocumentsAsync(paidFilter, cancellationToken: ct);

        var revenuePipeline = new[]
        {
            new BsonDocument("$match", new BsonDocument("paymentStatus", "paid")),
            new BsonDocument("$group", new BsonDocument("_id", BsonNull.Value).Add("total", new BsonDocument("$sum", "$total")))
        };

        if (vendorId != null)
        {
            revenuePipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument("vendorId", vendorId)),
                new BsonDocument("$match", new BsonDocument("paymentStatus", "paid")),
                new BsonDocument("$group", new BsonDocument("_id", BsonNull.Value).Add("total", new BsonDocument("$sum", "$total")))
            };
        }

        var revenueResult = await _orders.Aggregate<BsonDocument>(revenuePipeline).FirstOrDefaultAsync(ct);
        var totalRevenue = revenueResult?["total"]?.ToDecimal() ?? 0m;

        var vendorFilter = vendorId != null
            ? Builders<VendorProfile>.Filter.Eq(v => v.Id, vendorId)
            : FilterDefinition<VendorProfile>.Empty;
        var totalVendors = await _vendorProfiles.CountDocumentsAsync(
            vendorFilter & Builders<VendorProfile>.Filter.Eq(v => v.IsApproved, true), cancellationToken: ct);

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
        var filter = FilterDefinition<Order>.Empty;

        if (vendorId != null)
        {
            filter &= Builders<Order>.Filter.Eq(o => o.VendorId, vendorId);
        }

        if (from.HasValue)
        {
            filter &= Builders<Order>.Filter.Gte(o => o.CreatedAt, from.Value);
        }

        if (to.HasValue)
        {
            filter &= Builders<Order>.Filter.Lte(o => o.CreatedAt, to.Value);
        }

        // Build match stage directly from filter components
        var matchDoc = new BsonDocument();
        if (vendorId != null)
            matchDoc.Add("vendorId", vendorId);
        if (from.HasValue)
            matchDoc.Add("createdAt", new BsonDocument("$gte", from.Value));
        if (to.HasValue)
        {
            if (matchDoc.Contains("createdAt"))
                matchDoc["createdAt"].AsBsonDocument.Add("$lte", to.Value);
            else
                matchDoc.Add("createdAt", new BsonDocument("$lte", to.Value));
        }

        var pipeline = new[]
        {
            new BsonDocument("$match", matchDoc),
            new BsonDocument("$group",
                new BsonDocument("_id", new BsonDocument
                {
                    { "date", new BsonDocument("$dateToString", new BsonDocument { { "format", "%Y-%m-%d" }, { "date", "$createdAt" } }) },
                    { "status", "$status" }
                })
                .Add("count", new BsonDocument("$sum", 1))
                .Add("revenue", new BsonDocument("$sum", "$total")))
        };

        var results = await _orders.Aggregate<BsonDocument>(pipeline).ToListAsync(ct);

        var dailyStats = results
            .GroupBy(r => r["_id"]["date"].AsString)
            .Select(g => new
            {
                Date = g.Key,
                TotalOrders = g.Sum(x => x["count"].ToInt32()),
                TotalRevenue = g.Sum(x => x["revenue"].ToDecimal()) / 100m,
                ByStatus = g.ToDictionary(
                    x => x["_id"]["status"].AsString,
                    x => x["count"].ToInt32())
            })
            .OrderBy(x => x.Date)
            .ToList();

        return new { DailyStats = dailyStats };
    }

    public async Task<object> GetRevenueAnalyticsAsync(string? vendorId = null, DateTime? from = null, DateTime? to = null, CancellationToken ct = default)
    {
        var filter = Builders<Order>.Filter.Eq(o => o.PaymentStatus, PaymentStatus.Paid);

        if (vendorId != null)
        {
            filter &= Builders<Order>.Filter.Eq(o => o.VendorId, vendorId);
        }

        if (from.HasValue)
        {
            filter &= Builders<Order>.Filter.Gte(o => o.CreatedAt, from.Value);
        }

        if (to.HasValue)
        {
            filter &= Builders<Order>.Filter.Lte(o => o.CreatedAt, to.Value);
        }

        // Build match stage directly from filter components
        var matchDoc = new BsonDocument("paymentStatus", "paid");
        if (vendorId != null)
            matchDoc.Add("vendorId", vendorId);
        if (from.HasValue)
            matchDoc.Add("createdAt", new BsonDocument("$gte", from.Value));
        if (to.HasValue)
        {
            if (matchDoc.Contains("createdAt"))
                matchDoc["createdAt"].AsBsonDocument.Add("$lte", to.Value);
            else
                matchDoc.Add("createdAt", new BsonDocument("$lte", to.Value));
        }

        var pipeline = new[]
        {
            new BsonDocument("$match", matchDoc),
            new BsonDocument("$group",
                new BsonDocument("_id", new BsonDocument
                {
                    { "date", new BsonDocument("$dateToString", new BsonDocument { { "format", "%Y-%m-%d" }, { "date", "$createdAt" } }) }
                })
                .Add("revenue", new BsonDocument("$sum", "$total"))
                .Add("orders", new BsonDocument("$sum", 1))),
            new BsonDocument("$sort", new BsonDocument("_id.date", 1))
        };

        var results = await _orders.Aggregate<BsonDocument>(pipeline).ToListAsync(ct);

        var dailyRevenue = results.Select(r => new
        {
            Date = r["_id"]["date"].AsString,
            Revenue = r["revenue"].ToDecimal() / 100m,
            Orders = r["orders"].ToInt32()
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
        var pipeline = new[]
        {
            new BsonDocument("$match", new BsonDocument("paymentStatus", "paid")),
            new BsonDocument("$group",
                new BsonDocument("_id", "$vendorId")
                .Add("totalOrders", new BsonDocument("$sum", 1))
                .Add("totalRevenue", new BsonDocument("$sum", "$total"))),
            new BsonDocument("$sort", new BsonDocument("totalRevenue", -1))
        };

        var results = await _orders.Aggregate<BsonDocument>(pipeline).ToListAsync(ct);

        var vendorIds = results.Select(r => r["_id"].AsString).ToList();
        var vendors = await _vendorProfiles.Find(v => vendorIds.Contains(v.Id)).ToListAsync(ct);
        var vendorDict = vendors.ToDictionary(v => v.Id);

        var performance = results.Select(r =>
        {
            var vendorId = r["_id"].AsString;
            vendorDict.TryGetValue(vendorId, out var vendor);
            return new
            {
                VendorId = vendorId,
                BusinessName = vendor?.BusinessName ?? "Unknown",
                TotalOrders = r["totalOrders"].ToInt32(),
                TotalRevenue = r["totalRevenue"].ToDecimal() / 100m,
                Rating = vendor?.Rating ?? 0
            };
        }).ToList();

        return new { Vendors = performance };
    }
}
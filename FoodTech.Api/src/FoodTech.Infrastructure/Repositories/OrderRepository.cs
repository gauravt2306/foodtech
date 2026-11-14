using MongoDB.Driver;
using MongoDB.Bson;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Domain.Repositories;
using FoodTech.Infrastructure.Data;

namespace FoodTech.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly IMongoCollection<Order> _orders;

    public OrderRepository(MongoDbContext context)
    {
        _orders = context.Orders;
    }

    public async Task<Order?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _orders.Find(o => o.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default)
    {
        return await _orders.Find(o => o.OrderNumber == orderNumber).FirstOrDefaultAsync(ct);
    }

    public async Task<IEnumerable<Order>> GetByEmployeeIdAsync(string employeeId, CancellationToken ct = default)
    {
        return await _orders.Find(o => o.EmployeeId == employeeId)
            .SortByDescending(o => o.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Order>> GetByVendorIdAsync(string vendorId, CancellationToken ct = default)
    {
        return await _orders.Find(o => o.VendorId == vendorId)
            .SortByDescending(o => o.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Order>> GetByVendorIdAndStatusAsync(string vendorId, OrderStatus status, CancellationToken ct = default)
    {
        return await _orders.Find(o => o.VendorId == vendorId && o.Status == status)
            .SortByDescending(o => o.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Order>> GetByStatusAsync(OrderStatus status, CancellationToken ct = default)
    {
        return await _orders.Find(o => o.Status == status)
            .SortByDescending(o => o.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<Order> CreateAsync(Order order, CancellationToken ct = default)
    {
        order.CreatedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        // Generate order number if not provided
        if (string.IsNullOrEmpty(order.OrderNumber))
        {
            order.OrderNumber = GenerateOrderNumber();
        }

        await _orders.InsertOneAsync(order, cancellationToken: ct);
        return order;
    }

    public async Task<Order?> UpdateAsync(Order order, CancellationToken ct = default)
    {
        order.UpdatedAt = DateTime.UtcNow;
        var result = await _orders.ReplaceOneAsync(o => o.Id == order.Id, order, cancellationToken: ct);
        return result.ModifiedCount > 0 ? order : null;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var result = await _orders.DeleteOneAsync(o => o.Id == id, cancellationToken: ct);
        return result.DeletedCount > 0;
    }

    public async Task<bool> ExistsByOrderNumberAsync(string orderNumber, CancellationToken ct = default)
    {
        var filter = Builders<Order>.Filter.Eq(o => o.OrderNumber, orderNumber);
        var count = await _orders.CountDocumentsAsync(filter, cancellationToken: ct);
        return count > 0;
    }

    public async Task<long> CountByVendorIdAsync(string vendorId, CancellationToken ct = default)
    {
        var filter = Builders<Order>.Filter.Eq(o => o.VendorId, vendorId);
        return await _orders.CountDocumentsAsync(filter, cancellationToken: ct);
    }

    public async Task<long> CountByVendorIdAndStatusAsync(string vendorId, OrderStatus status, CancellationToken ct = default)
    {
        var filter = Builders<Order>.Filter.Eq(o => o.VendorId, vendorId) & Builders<Order>.Filter.Eq(o => o.Status, status);
        return await _orders.CountDocumentsAsync(filter, cancellationToken: ct);
    }

    public async Task<decimal> GetTotalRevenueByVendorIdAsync(string vendorId, CancellationToken ct = default)
    {
        var pipeline = new[]
        {
            new BsonDocument("$match",
                new BsonDocument("vendorId", vendorId).Add("paymentStatus", "paid")),
            new BsonDocument("$group",
                new BsonDocument("_id", BsonNull.Value).Add("total", new BsonDocument("$sum", "$total")))
        };

        var result = await _orders.Aggregate<BsonDocument>(pipeline).FirstOrDefaultAsync(ct);
        return result?["total"]?.ToDecimal() ?? 0m;
    }

    private static string GenerateOrderNumber()
    {
        var date = DateTime.UtcNow;
        var dateStr = date.ToString("yyyyMMdd");
        var random = Random.Shared.Next(10000).ToString("D4");
        return $"ORD-{dateStr}-{random}";
    }
}
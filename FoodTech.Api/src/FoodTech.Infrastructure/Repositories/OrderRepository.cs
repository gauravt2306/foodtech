using Microsoft.EntityFrameworkCore;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Domain.Repositories;
using FoodTech.Infrastructure.Data;

namespace FoodTech.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public OrderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Order?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);
    }

    public async Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default)
    {
        return await _context.Orders.FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, ct);
    }

    public async Task<Order?> GetByPaymentIdAsync(string paymentId, CancellationToken ct = default)
    {
        return await _context.Orders.FirstOrDefaultAsync(o => o.PaymentId == paymentId, ct);
    }

    public async Task<IEnumerable<Order>> GetByEmployeeIdAsync(string employeeId, CancellationToken ct = default)
    {
        return await _context.Orders
            .Where(o => o.EmployeeId == employeeId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Order>> GetByVendorIdAsync(string vendorId, CancellationToken ct = default)
    {
        return await _context.Orders
            .Where(o => o.VendorId == vendorId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Order>> GetByVendorIdAndStatusAsync(string vendorId, OrderStatus status, CancellationToken ct = default)
    {
        return await _context.Orders
            .Where(o => o.VendorId == vendorId && o.Status == status)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Order>> GetByStatusAsync(OrderStatus status, CancellationToken ct = default)
    {
        return await _context.Orders
            .Where(o => o.Status == status)
            .OrderByDescending(o => o.CreatedAt)
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

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(ct);

        // Reload to get database-generated ID (for ValueGeneratedOnAdd)
        await _context.Entry(order).ReloadAsync(ct);
        return order;
    }

    public async Task<Order?> UpdateAsync(Order order, CancellationToken ct = default)
    {
        order.UpdatedAt = DateTime.UtcNow;
        _context.Orders.Update(order);
        var result = await _context.SaveChangesAsync(ct);
        return result > 0 ? order : null;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);
        if (order == null) return false;
        _context.Orders.Remove(order);
        var result = await _context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> ExistsByOrderNumberAsync(string orderNumber, CancellationToken ct = default)
    {
        return await _context.Orders.AnyAsync(o => o.OrderNumber == orderNumber, ct);
    }

    public async Task<long> CountByVendorIdAsync(string vendorId, CancellationToken ct = default)
    {
        return await _context.Orders.LongCountAsync(o => o.VendorId == vendorId, ct);
    }

    public async Task<long> CountByVendorIdAndStatusAsync(string vendorId, OrderStatus status, CancellationToken ct = default)
    {
        return await _context.Orders.LongCountAsync(o => o.VendorId == vendorId && o.Status == status, ct);
    }

    public async Task<decimal> GetTotalRevenueByVendorIdAsync(string vendorId, CancellationToken ct = default)
    {
        var total = await _context.Orders
            .Where(o => o.VendorId == vendorId && o.PaymentStatus == PaymentStatus.Paid)
            .SumAsync(o => (decimal?)o.Total, ct);

        return total ?? 0m;
    }

    private static string GenerateOrderNumber()
    {
        var date = DateTime.UtcNow;
        var dateStr = date.ToString("yyyyMMdd");
        var random = Random.Shared.Next(10000).ToString("D4");
        return $"ORD-{dateStr}-{random}";
    }
}
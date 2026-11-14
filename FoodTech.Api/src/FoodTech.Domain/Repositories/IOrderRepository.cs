using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;

namespace FoodTech.Domain.Repositories;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default);
    Task<IEnumerable<Order>> GetByEmployeeIdAsync(string employeeId, CancellationToken ct = default);
    Task<IEnumerable<Order>> GetByVendorIdAsync(string vendorId, CancellationToken ct = default);
    Task<IEnumerable<Order>> GetByVendorIdAndStatusAsync(string vendorId, OrderStatus status, CancellationToken ct = default);
    Task<IEnumerable<Order>> GetByStatusAsync(OrderStatus status, CancellationToken ct = default);
    Task<Order> CreateAsync(Order order, CancellationToken ct = default);
    Task<Order?> UpdateAsync(Order order, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
    Task<bool> ExistsByOrderNumberAsync(string orderNumber, CancellationToken ct = default);
    Task<long> CountByVendorIdAsync(string vendorId, CancellationToken ct = default);
    Task<long> CountByVendorIdAndStatusAsync(string vendorId, OrderStatus status, CancellationToken ct = default);
    Task<decimal> GetTotalRevenueByVendorIdAsync(string vendorId, CancellationToken ct = default);
}
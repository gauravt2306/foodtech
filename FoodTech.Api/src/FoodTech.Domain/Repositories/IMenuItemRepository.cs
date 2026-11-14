using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;

namespace FoodTech.Domain.Repositories;

public interface IMenuItemRepository
{
    Task<MenuItem?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<IEnumerable<MenuItem>> GetByVendorIdAsync(string vendorId, CancellationToken ct = default);
    Task<IEnumerable<MenuItem>> GetByVendorIdAndCategoryAsync(string vendorId, Category category, CancellationToken ct = default);
    Task<IEnumerable<MenuItem>> GetAvailableByVendorIdAsync(string vendorId, CancellationToken ct = default);
    Task<IEnumerable<MenuItem>> GetAvailableByVendorIdAndCategoryAsync(string vendorId, Category category, CancellationToken ct = default);
    Task<MenuItem> CreateAsync(MenuItem menuItem, CancellationToken ct = default);
    Task<MenuItem?> UpdateAsync(MenuItem menuItem, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
    Task<bool> ExistsAsync(string id, CancellationToken ct = default);
    Task<long> CountByVendorIdAsync(string vendorId, CancellationToken ct = default);
}
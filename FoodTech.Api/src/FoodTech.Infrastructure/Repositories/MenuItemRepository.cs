using MongoDB.Driver;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Domain.Repositories;
using FoodTech.Infrastructure.Data;

namespace FoodTech.Infrastructure.Repositories;

public class MenuItemRepository : IMenuItemRepository
{
    private readonly IMongoCollection<MenuItem> _menuItems;

    public MenuItemRepository(MongoDbContext context)
    {
        _menuItems = context.MenuItems;
    }

    public async Task<MenuItem?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _menuItems.Find(m => m.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<IEnumerable<MenuItem>> GetByVendorIdAsync(string vendorId, CancellationToken ct = default)
    {
        return await _menuItems.Find(m => m.VendorId == vendorId).ToListAsync(ct);
    }

    public async Task<IEnumerable<MenuItem>> GetByVendorIdAndCategoryAsync(string vendorId, Category category, CancellationToken ct = default)
    {
        return await _menuItems.Find(m => m.VendorId == vendorId && m.Category == category).ToListAsync(ct);
    }

    public async Task<IEnumerable<MenuItem>> GetAvailableByVendorIdAsync(string vendorId, CancellationToken ct = default)
    {
        return await _menuItems.Find(m => m.VendorId == vendorId && m.IsAvailable).ToListAsync(ct);
    }

    public async Task<IEnumerable<MenuItem>> GetAvailableByVendorIdAndCategoryAsync(string vendorId, Category category, CancellationToken ct = default)
    {
        return await _menuItems.Find(m => m.VendorId == vendorId && m.IsAvailable && m.Category == category).ToListAsync(ct);
    }

    public async Task<MenuItem> CreateAsync(MenuItem menuItem, CancellationToken ct = default)
    {
        menuItem.CreatedAt = DateTime.UtcNow;
        menuItem.UpdatedAt = DateTime.UtcNow;
        await _menuItems.InsertOneAsync(menuItem, cancellationToken: ct);
        return menuItem;
    }

    public async Task<MenuItem?> UpdateAsync(MenuItem menuItem, CancellationToken ct = default)
    {
        menuItem.UpdatedAt = DateTime.UtcNow;
        var result = await _menuItems.ReplaceOneAsync(m => m.Id == menuItem.Id, menuItem, cancellationToken: ct);
        return result.ModifiedCount > 0 ? menuItem : null;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var result = await _menuItems.DeleteOneAsync(m => m.Id == id, cancellationToken: ct);
        return result.DeletedCount > 0;
    }

    public async Task<bool> ExistsAsync(string id, CancellationToken ct = default)
    {
        var filter = Builders<MenuItem>.Filter.Eq(m => m.Id, id);
        var count = await _menuItems.CountDocumentsAsync(filter, cancellationToken: ct);
        return count > 0;
    }

    public async Task<long> CountByVendorIdAsync(string vendorId, CancellationToken ct = default)
    {
        var filter = Builders<MenuItem>.Filter.Eq(m => m.VendorId, vendorId);
        return await _menuItems.CountDocumentsAsync(filter, cancellationToken: ct);
    }
}
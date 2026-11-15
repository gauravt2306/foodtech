using Microsoft.EntityFrameworkCore;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Domain.Repositories;
using FoodTech.Infrastructure.Data;

namespace FoodTech.Infrastructure.Repositories;

public class MenuItemRepository : IMenuItemRepository
{
    private readonly AppDbContext _context;

    public MenuItemRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<MenuItem?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.MenuItems.FirstOrDefaultAsync(m => m.Id == id, ct);
    }

    public async Task<IEnumerable<MenuItem>> GetByVendorIdAsync(string vendorId, CancellationToken ct = default)
    {
        return await _context.MenuItems
            .Where(m => m.VendorId == vendorId)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<MenuItem>> GetByVendorIdAndCategoryAsync(string vendorId, Category category, CancellationToken ct = default)
    {
        return await _context.MenuItems
            .Where(m => m.VendorId == vendorId && m.Category == category)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<MenuItem>> GetAvailableByVendorIdAsync(string vendorId, CancellationToken ct = default)
    {
        return await _context.MenuItems
            .Where(m => m.VendorId == vendorId && m.IsAvailable)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<MenuItem>> GetAvailableByVendorIdAndCategoryAsync(string vendorId, Category category, CancellationToken ct = default)
    {
        return await _context.MenuItems
            .Where(m => m.VendorId == vendorId && m.IsAvailable && m.Category == category)
            .ToListAsync(ct);
    }

    public async Task<MenuItem> CreateAsync(MenuItem menuItem, CancellationToken ct = default)
    {
        menuItem.CreatedAt = DateTime.UtcNow;
        menuItem.UpdatedAt = DateTime.UtcNow;
        _context.MenuItems.Add(menuItem);
        await _context.SaveChangesAsync(ct);

        // Reload to get database-generated ID (for ValueGeneratedOnAdd)
        await _context.Entry(menuItem).ReloadAsync(ct);
        return menuItem;
    }

    public async Task<MenuItem?> UpdateAsync(MenuItem menuItem, CancellationToken ct = default)
    {
        menuItem.UpdatedAt = DateTime.UtcNow;
        _context.MenuItems.Update(menuItem);
        var result = await _context.SaveChangesAsync(ct);
        return result > 0 ? menuItem : null;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var menuItem = await _context.MenuItems.FirstOrDefaultAsync(m => m.Id == id, ct);
        if (menuItem == null) return false;
        _context.MenuItems.Remove(menuItem);
        var result = await _context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> ExistsAsync(string id, CancellationToken ct = default)
    {
        return await _context.MenuItems.AnyAsync(m => m.Id == id, ct);
    }

    public async Task<long> CountByVendorIdAsync(string vendorId, CancellationToken ct = default)
    {
        return await _context.MenuItems.LongCountAsync(m => m.VendorId == vendorId, ct);
    }
}
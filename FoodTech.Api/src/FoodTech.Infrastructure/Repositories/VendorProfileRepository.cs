using Microsoft.EntityFrameworkCore;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Domain.Repositories;
using FoodTech.Infrastructure.Data;

namespace FoodTech.Infrastructure.Repositories;

public class VendorProfileRepository : IVendorProfileRepository
{
    private readonly AppDbContext _context;

    public VendorProfileRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<VendorProfile?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.VendorProfiles.FirstOrDefaultAsync(v => v.Id == id, ct);
    }

    public async Task<VendorProfile?> GetByUserIdAsync(string userId, CancellationToken ct = default)
    {
        return await _context.VendorProfiles.FirstOrDefaultAsync(v => v.UserId == userId, ct);
    }

    public async Task<VendorProfile?> GetByGstNumberAsync(string gstNumber, CancellationToken ct = default)
    {
        return await _context.VendorProfiles.FirstOrDefaultAsync(v => v.GstNumber == gstNumber, ct);
    }

    public async Task<IEnumerable<VendorProfile>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.VendorProfiles.ToListAsync(ct);
    }

    public async Task<IEnumerable<VendorProfile>> GetApprovedAsync(CancellationToken ct = default)
    {
        return await _context.VendorProfiles
            .Where(v => v.IsApproved)
            .OrderByDescending(v => v.Rating)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<VendorProfile>> GetPendingApprovalAsync(CancellationToken ct = default)
    {
        return await _context.VendorProfiles
            .Where(v => !v.IsApproved)
            .ToListAsync(ct);
    }

    public async Task<VendorProfile> CreateAsync(VendorProfile vendorProfile, CancellationToken ct = default)
    {
        vendorProfile.CreatedAt = DateTime.UtcNow;
        vendorProfile.UpdatedAt = DateTime.UtcNow;
        _context.VendorProfiles.Add(vendorProfile);
        await _context.SaveChangesAsync(ct);
        return vendorProfile;
    }

    public async Task<VendorProfile?> UpdateAsync(VendorProfile vendorProfile, CancellationToken ct = default)
    {
        vendorProfile.UpdatedAt = DateTime.UtcNow;
        _context.VendorProfiles.Update(vendorProfile);
        var result = await _context.SaveChangesAsync(ct);
        return result > 0 ? vendorProfile : null;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var vendorProfile = await _context.VendorProfiles.FirstOrDefaultAsync(v => v.Id == id, ct);
        if (vendorProfile == null) return false;
        _context.VendorProfiles.Remove(vendorProfile);
        var result = await _context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> ExistsByGstNumberAsync(string gstNumber, CancellationToken ct = default)
    {
        return await _context.VendorProfiles.AnyAsync(v => v.GstNumber == gstNumber, ct);
    }

    public async Task<long> CountApprovedAsync(CancellationToken ct = default)
    {
        return await _context.VendorProfiles.LongCountAsync(v => v.IsApproved, ct);
    }
}
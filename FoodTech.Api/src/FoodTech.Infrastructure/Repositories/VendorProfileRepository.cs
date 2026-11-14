using MongoDB.Driver;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Domain.Repositories;
using FoodTech.Infrastructure.Data;

namespace FoodTech.Infrastructure.Repositories;

public class VendorProfileRepository : IVendorProfileRepository
{
    private readonly IMongoCollection<VendorProfile> _vendorProfiles;

    public VendorProfileRepository(MongoDbContext context)
    {
        _vendorProfiles = context.VendorProfiles;
    }

    public async Task<VendorProfile?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _vendorProfiles.Find(v => v.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<VendorProfile?> GetByUserIdAsync(string userId, CancellationToken ct = default)
    {
        return await _vendorProfiles.Find(v => v.UserId == userId).FirstOrDefaultAsync(ct);
    }

    public async Task<VendorProfile?> GetByGstNumberAsync(string gstNumber, CancellationToken ct = default)
    {
        return await _vendorProfiles.Find(v => v.GstNumber == gstNumber).FirstOrDefaultAsync(ct);
    }

    public async Task<IEnumerable<VendorProfile>> GetAllAsync(CancellationToken ct = default)
    {
        return await _vendorProfiles.Find(_ => true).ToListAsync(ct);
    }

    public async Task<IEnumerable<VendorProfile>> GetApprovedAsync(CancellationToken ct = default)
    {
        return await _vendorProfiles.Find(v => v.IsApproved).SortByDescending(v => v.Rating).ToListAsync(ct);
    }

    public async Task<IEnumerable<VendorProfile>> GetPendingApprovalAsync(CancellationToken ct = default)
    {
        return await _vendorProfiles.Find(v => !v.IsApproved).ToListAsync(ct);
    }

    public async Task<VendorProfile> CreateAsync(VendorProfile vendorProfile, CancellationToken ct = default)
    {
        vendorProfile.CreatedAt = DateTime.UtcNow;
        vendorProfile.UpdatedAt = DateTime.UtcNow;
        await _vendorProfiles.InsertOneAsync(vendorProfile, cancellationToken: ct);
        return vendorProfile;
    }

    public async Task<VendorProfile?> UpdateAsync(VendorProfile vendorProfile, CancellationToken ct = default)
    {
        vendorProfile.UpdatedAt = DateTime.UtcNow;
        var result = await _vendorProfiles.ReplaceOneAsync(v => v.Id == vendorProfile.Id, vendorProfile, cancellationToken: ct);
        return result.ModifiedCount > 0 ? vendorProfile : null;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var result = await _vendorProfiles.DeleteOneAsync(v => v.Id == id, cancellationToken: ct);
        return result.DeletedCount > 0;
    }

    public async Task<bool> ExistsByGstNumberAsync(string gstNumber, CancellationToken ct = default)
    {
        var filter = Builders<VendorProfile>.Filter.Eq(v => v.GstNumber, gstNumber);
        var count = await _vendorProfiles.CountDocumentsAsync(filter, cancellationToken: ct);
        return count > 0;
    }

    public async Task<long> CountApprovedAsync(CancellationToken ct = default)
    {
        var filter = Builders<VendorProfile>.Filter.Eq(v => v.IsApproved, true);
        return await _vendorProfiles.CountDocumentsAsync(filter, cancellationToken: ct);
    }
}
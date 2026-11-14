using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;

namespace FoodTech.Domain.Repositories;

public interface IVendorProfileRepository
{
    Task<VendorProfile?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<VendorProfile?> GetByUserIdAsync(string userId, CancellationToken ct = default);
    Task<VendorProfile?> GetByGstNumberAsync(string gstNumber, CancellationToken ct = default);
    Task<IEnumerable<VendorProfile>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<VendorProfile>> GetApprovedAsync(CancellationToken ct = default);
    Task<IEnumerable<VendorProfile>> GetPendingApprovalAsync(CancellationToken ct = default);
    Task<VendorProfile> CreateAsync(VendorProfile vendorProfile, CancellationToken ct = default);
    Task<VendorProfile?> UpdateAsync(VendorProfile vendorProfile, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
    Task<bool> ExistsByGstNumberAsync(string gstNumber, CancellationToken ct = default);
    Task<long> CountApprovedAsync(CancellationToken ct = default);
}
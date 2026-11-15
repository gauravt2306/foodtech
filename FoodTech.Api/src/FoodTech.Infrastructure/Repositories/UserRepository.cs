using Microsoft.EntityFrameworkCore;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Domain.Repositories;
using FoodTech.Infrastructure.Data;

namespace FoodTech.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
    }

    public async Task<User?> GetByPhoneAsync(string phone, CancellationToken ct = default)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Phone == phone, ct);
    }

    public async Task<IEnumerable<User>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.Users.ToListAsync(ct);
    }

    public async Task<IEnumerable<User>> GetByRoleAsync(UserRole role, CancellationToken ct = default)
    {
        return await _context.Users.Where(u => u.Role == role).ToListAsync(ct);
    }

    public async Task<User> CreateAsync(User user, CancellationToken ct = default)
    {
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        _context.Users.Add(user);
        await _context.SaveChangesAsync(ct);
        return user;
    }

    public async Task<User?> UpdateAsync(User user, CancellationToken ct = default)
    {
        user.UpdatedAt = DateTime.UtcNow;
        _context.Users.Update(user);
        var result = await _context.SaveChangesAsync(ct);
        return result > 0 ? user : null;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user == null) return false;
        _context.Users.Remove(user);
        var result = await _context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default)
    {
        return await _context.Users.AnyAsync(u => u.Email == email, ct);
    }

    public async Task<bool> ExistsByPhoneAsync(string phone, CancellationToken ct = default)
    {
        return await _context.Users.AnyAsync(u => u.Phone == phone, ct);
    }
}
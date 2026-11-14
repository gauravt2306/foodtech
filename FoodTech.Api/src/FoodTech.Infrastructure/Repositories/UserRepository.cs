using MongoDB.Driver;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Domain.Repositories;
using FoodTech.Infrastructure.Data;

namespace FoodTech.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _users;

    public UserRepository(MongoDbContext context)
    {
        _users = context.Users;
    }

    public async Task<User?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _users.Find(u => u.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        return await _users.Find(u => u.Email == email).FirstOrDefaultAsync(ct);
    }

    public async Task<User?> GetByPhoneAsync(string phone, CancellationToken ct = default)
    {
        return await _users.Find(u => u.Phone == phone).FirstOrDefaultAsync(ct);
    }

    public async Task<IEnumerable<User>> GetAllAsync(CancellationToken ct = default)
    {
        return await _users.Find(_ => true).ToListAsync(ct);
    }

    public async Task<IEnumerable<User>> GetByRoleAsync(UserRole role, CancellationToken ct = default)
    {
        return await _users.Find(u => u.Role == role).ToListAsync(ct);
    }

    public async Task<User> CreateAsync(User user, CancellationToken ct = default)
    {
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        await _users.InsertOneAsync(user, cancellationToken: ct);
        return user;
    }

    public async Task<User?> UpdateAsync(User user, CancellationToken ct = default)
    {
        user.UpdatedAt = DateTime.UtcNow;
        var result = await _users.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: ct);
        return result.ModifiedCount > 0 ? user : null;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var result = await _users.DeleteOneAsync(u => u.Id == id, ct);
        return result.DeletedCount > 0;
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default)
    {
        var count = await _users.CountDocumentsAsync(u => u.Email == email, cancellationToken: ct);
        return count > 0;
    }

    public async Task<bool> ExistsByPhoneAsync(string phone, CancellationToken ct = default)
    {
        var count = await _users.CountDocumentsAsync(u => u.Phone == phone, cancellationToken: ct);
        return count > 0;
    }
}
using Microsoft.EntityFrameworkCore;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Infrastructure.Data.EntityConfigurations;

namespace FoodTech.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<VendorProfile> VendorProfiles => Set<VendorProfile>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new VendorProfileConfiguration());
        modelBuilder.ApplyConfiguration(new MenuItemConfiguration());
        modelBuilder.ApplyConfiguration(new OrderConfiguration());

        // PostgreSQL enum types
        modelBuilder.HasPostgresEnum<UserRole>();
        modelBuilder.HasPostgresEnum<Category>();
        modelBuilder.HasPostgresEnum<DietType>();
        modelBuilder.HasPostgresEnum<OrderStatus>();
        modelBuilder.HasPostgresEnum<PaymentMethod>();
        modelBuilder.HasPostgresEnum<PaymentStatus>();
    }
}
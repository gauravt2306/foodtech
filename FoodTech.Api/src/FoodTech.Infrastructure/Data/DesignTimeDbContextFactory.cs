using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using FoodTech.Infrastructure.Data;

namespace FoodTech.Infrastructure.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=foodtech_test;Username=test;Password=test");
        return new AppDbContext(optionsBuilder.Options);
    }
}
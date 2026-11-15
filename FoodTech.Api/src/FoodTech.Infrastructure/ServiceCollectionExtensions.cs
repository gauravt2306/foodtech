using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using FoodTech.Domain.Repositories;
using FoodTech.Domain.Services;
using FoodTech.Infrastructure.Auth;
using FoodTech.Infrastructure.Data;
using FoodTech.Infrastructure.Repositories;
using FoodTech.Infrastructure.Services;

namespace FoodTech.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure settings
        services.Configure<PostgreSqlSettings>(configuration.GetSection(PostgreSqlSettings.SectionName));
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

        // Register EF Core DbContext
        services.AddDbContext<AppDbContext>((sp, options) =>
        {
            var settings = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<PostgreSqlSettings>>().Value;
            options.UseNpgsql(settings.ConnectionString);
        });

        // Register repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IVendorProfileRepository, VendorProfileRepository>();
        services.AddScoped<IMenuItemRepository, MenuItemRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();

        // Register services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IQRService, QRService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();

        return services;
    }

    public static async Task<IServiceCollection> InitializeDatabaseAsync(this IServiceCollection services)
    {
        using var scope = services.BuildServiceProvider().CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await context.Database.MigrateAsync();
        return services;
    }
}
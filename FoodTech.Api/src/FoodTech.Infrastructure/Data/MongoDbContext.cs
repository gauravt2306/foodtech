using MongoDB.Driver;
using MongoDB.Driver.Core.Configuration;
using System.Security.Cryptography.X509Certificates;
using FoodTech.Domain.Entities;
using FoodTech.Infrastructure.Data;

namespace FoodTech.Infrastructure.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(MongoDbSettings settings)
    {
        var clientSettings = MongoClientSettings.FromConnectionString(settings.ConnectionString);

        // Configure TLS for X.509 authentication if client certificate is provided
        if (!string.IsNullOrEmpty(settings.ClientCertificatePath) && File.Exists(settings.ClientCertificatePath))
        {
            clientSettings.UseTls = true;
            var cert = X509CertificateLoader.LoadPkcs12FromFile(
                settings.ClientCertificatePath,
                settings.ClientCertificatePassword ?? string.Empty,
                X509KeyStorageFlags.Exportable | X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.PersistKeySet);
            clientSettings.SslSettings = new SslSettings
            {
                ClientCertificates = new[] { cert }
            };
        }

        var client = new MongoClient(clientSettings);
        _database = client.GetDatabase(settings.DatabaseName);
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<VendorProfile> VendorProfiles => _database.GetCollection<VendorProfile>("vendorprofiles");
    public IMongoCollection<MenuItem> MenuItems => _database.GetCollection<MenuItem>("menuitems");
    public IMongoCollection<Order> Orders => _database.GetCollection<Order>("orders");

    public async Task CreateIndexesAsync(CancellationToken ct = default)
    {
        // Users indexes
        await Users.Indexes.CreateOneAsync(
            new CreateIndexModel<User>(Builders<User>.IndexKeys.Ascending(u => u.Email), new CreateIndexOptions { Unique = true }),
            cancellationToken: ct);
        await Users.Indexes.CreateOneAsync(
            new CreateIndexModel<User>(Builders<User>.IndexKeys.Ascending(u => u.Role).Ascending(u => u.IsActive)),
            cancellationToken: ct);
        await Users.Indexes.CreateOneAsync(
            new CreateIndexModel<User>(Builders<User>.IndexKeys.Ascending(u => u.Phone), new CreateIndexOptions { Sparse = true }),
            cancellationToken: ct);

        // VendorProfiles indexes
        await VendorProfiles.Indexes.CreateOneAsync(
            new CreateIndexModel<VendorProfile>(Builders<VendorProfile>.IndexKeys.Ascending(v => v.UserId), new CreateIndexOptions { Unique = true }),
            cancellationToken: ct);
        await VendorProfiles.Indexes.CreateOneAsync(
            new CreateIndexModel<VendorProfile>(Builders<VendorProfile>.IndexKeys.Ascending(v => v.BusinessName)),
            cancellationToken: ct);
        await VendorProfiles.Indexes.CreateOneAsync(
            new CreateIndexModel<VendorProfile>(Builders<VendorProfile>.IndexKeys.Ascending(v => v.GstNumber), new CreateIndexOptions { Unique = true, Sparse = true }),
            cancellationToken: ct);
        await VendorProfiles.Indexes.CreateOneAsync(
            new CreateIndexModel<VendorProfile>(Builders<VendorProfile>.IndexKeys.Ascending(v => v.IsApproved).Descending(v => v.Rating)),
            cancellationToken: ct);

        // MenuItems indexes
        await MenuItems.Indexes.CreateOneAsync(
            new CreateIndexModel<MenuItem>(Builders<MenuItem>.IndexKeys.Ascending(m => m.VendorId).Ascending(m => m.Category)),
            cancellationToken: ct);
        await MenuItems.Indexes.CreateOneAsync(
            new CreateIndexModel<MenuItem>(Builders<MenuItem>.IndexKeys.Ascending(m => m.VendorId).Ascending(m => m.IsAvailable)),
            cancellationToken: ct);
        await MenuItems.Indexes.CreateOneAsync(
            new CreateIndexModel<MenuItem>(Builders<MenuItem>.IndexKeys.Ascending(m => m.VendorId).Ascending(m => m.DietType)),
            cancellationToken: ct);

        // Orders indexes
        await Orders.Indexes.CreateOneAsync(
            new CreateIndexModel<Order>(Builders<Order>.IndexKeys.Ascending(o => o.OrderNumber), new CreateIndexOptions { Unique = true }),
            cancellationToken: ct);
        await Orders.Indexes.CreateOneAsync(
            new CreateIndexModel<Order>(Builders<Order>.IndexKeys.Ascending(o => o.EmployeeId).Descending(o => o.CreatedAt)),
            cancellationToken: ct);
        await Orders.Indexes.CreateOneAsync(
            new CreateIndexModel<Order>(Builders<Order>.IndexKeys.Ascending(o => o.VendorId).Ascending(o => o.Status)),
            cancellationToken: ct);
        await Orders.Indexes.CreateOneAsync(
            new CreateIndexModel<Order>(Builders<Order>.IndexKeys.Ascending(o => o.VendorId).Descending(o => o.CreatedAt)),
            cancellationToken: ct);
        await Orders.Indexes.CreateOneAsync(
            new CreateIndexModel<Order>(Builders<Order>.IndexKeys.Ascending(o => o.Status).Descending(o => o.CreatedAt)),
            cancellationToken: ct);
        await Orders.Indexes.CreateOneAsync(
            new CreateIndexModel<Order>(Builders<Order>.IndexKeys.Ascending(o => o.PaymentId), new CreateIndexOptions { Sparse = true }),
            cancellationToken: ct);
    }
}
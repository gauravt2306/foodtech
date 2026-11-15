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

            // Handle both PEM and PKCS12 formats
            var certPath = settings.ClientCertificatePath;
            var cert = LoadCertificate(certPath, settings.ClientCertificatePassword ?? string.Empty);

            clientSettings.SslSettings = new SslSettings
            {
                ClientCertificates = new[] { cert }
            };
        }

        var client = new MongoClient(clientSettings);
        _database = client.GetDatabase(settings.DatabaseName);
    }

    private static X509Certificate2 LoadCertificate(string path, string password)
    {
        var pemText = File.ReadAllText(path);

        // Split concatenated PEM (cert + private key) into separate parts
        var certStart = pemText.IndexOf("-----BEGIN CERTIFICATE-----", StringComparison.Ordinal);
        var certEnd = pemText.IndexOf("-----END CERTIFICATE-----", StringComparison.Ordinal);
        var keyStart = pemText.IndexOf("-----BEGIN PRIVATE KEY-----", StringComparison.Ordinal);
        var keyEnd = pemText.IndexOf("-----END PRIVATE KEY-----", StringComparison.Ordinal);

        // Also check for other private key formats
        if (keyStart == -1) keyStart = pemText.IndexOf("-----BEGIN RSA PRIVATE KEY-----", StringComparison.Ordinal);
        if (keyEnd == -1) keyEnd = pemText.IndexOf("-----END RSA PRIVATE KEY-----", StringComparison.Ordinal);
        if (keyStart == -1) keyStart = pemText.IndexOf("-----BEGIN ENCRYPTED PRIVATE KEY-----", StringComparison.Ordinal);
        if (keyEnd == -1) keyEnd = pemText.IndexOf("-----END ENCRYPTED PRIVATE KEY-----", StringComparison.Ordinal);

        if (certStart >= 0 && certEnd >= 0 && keyStart >= 0 && keyEnd >= 0)
        {
            // Extract cert and key separately
            var certPem = pemText.Substring(certStart, certEnd - certStart + "-----END CERTIFICATE-----".Length);
            var keyPem = pemText.Substring(keyStart, keyEnd - keyStart + "-----END PRIVATE KEY-----".Length);
            var rsaKeyStart = pemText.IndexOf("-----BEGIN RSA PRIVATE KEY-----", StringComparison.Ordinal);
            var rsaKeyEnd = pemText.IndexOf("-----END RSA PRIVATE KEY-----", StringComparison.Ordinal);
            if (rsaKeyStart >= 0 && rsaKeyEnd >= 0) keyPem = pemText.Substring(rsaKeyStart, rsaKeyEnd - rsaKeyStart + "-----END RSA PRIVATE KEY-----".Length);

            var encKeyStart = pemText.IndexOf("-----BEGIN ENCRYPTED PRIVATE KEY-----", StringComparison.Ordinal);
            var encKeyEnd = pemText.IndexOf("-----END ENCRYPTED PRIVATE KEY-----", StringComparison.Ordinal);
            if (encKeyStart >= 0 && encKeyEnd >= 0) keyPem = pemText.Substring(encKeyStart, encKeyEnd - encKeyStart + "-----END ENCRYPTED PRIVATE KEY-----".Length);

            try
            {
                // Use CreateFromPem with separate cert and key strings
                return X509Certificate2.CreateFromPem(certPem, keyPem);
            }
            catch
            {
                // Fall through to fallback
            }
        }

        // Fallback: try loading as single PEM (cert only or cert+key)
        try
        {
            if (pemText.Contains("BEGIN CERTIFICATE"))
            {
                if (pemText.Contains("BEGIN PRIVATE KEY") || pemText.Contains("BEGIN RSA PRIVATE KEY") || pemText.Contains("BEGIN ENCRYPTED PRIVATE KEY"))
                {
                    return X509Certificate2.CreateFromPem(pemText, password);
                }
                return X509Certificate2.CreateFromPem(pemText);
            }
        }
        catch
        {
            // Fall through to PKCS12 loading
        }

        // Fallback to PKCS12 format
        return X509CertificateLoader.LoadPkcs12FromFile(
            path,
            password,
            X509KeyStorageFlags.Exportable | X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.PersistKeySet);
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
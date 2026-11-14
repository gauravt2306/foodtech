namespace FoodTech.Infrastructure.Data;

public class MongoDbSettings
{
    public const string SectionName = "MongoDb";

    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
    public string? ClientCertificatePath { get; set; }
    public string? ClientCertificatePassword { get; set; }
}
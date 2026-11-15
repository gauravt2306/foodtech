namespace FoodTech.Infrastructure.Data;

public class PostgreSqlSettings
{
    public const string SectionName = "PostgreSql";
    public string ConnectionString { get; set; } = string.Empty;
}
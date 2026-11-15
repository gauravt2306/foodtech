using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json;
using FoodTech.Domain.Entities;

namespace FoodTech.Infrastructure.Data.EntityConfigurations;

public class MenuItemConfiguration : IEntityTypeConfiguration<MenuItem>
{
    public void Configure(EntityTypeBuilder<MenuItem> builder)
    {
        builder.ToTable("menu_items");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id)
            .HasColumnType("text")
            .HasDefaultValueSql("gen_random_uuid()::text")
            .ValueGeneratedOnAdd();

        builder.Property(m => m.VendorId)
            .IsRequired()
            .HasColumnType("text");
        builder.HasIndex(m => m.VendorId);

        builder.Property(m => m.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.Description)
            .HasMaxLength(1000);

        builder.Property(m => m.Price)
            .IsRequired()
            .HasColumnType("bigint");

        builder.Property(m => m.Category)
            .IsRequired()
            .HasConversion<string>()
            .HasColumnType("text");
        builder.HasIndex(m => new { m.VendorId, m.Category });

        builder.Property(m => m.DietType)
            .IsRequired()
            .HasConversion<string>()
            .HasColumnType("text");
        builder.HasIndex(m => new { m.VendorId, m.DietType });

        builder.Property(m => m.ImageUrl)
            .HasMaxLength(500);

        builder.Property(m => m.IsAvailable)
            .IsRequired()
            .HasDefaultValue(true);
        builder.HasIndex(m => new { m.VendorId, m.IsAvailable });

        builder.Property(m => m.PrepTimeMinutes)
            .IsRequired();

        var tagsConverter = new ValueConverter<string[], string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            v => JsonSerializer.Deserialize<string[]>(v, (JsonSerializerOptions?)null) ?? Array.Empty<string>());

        builder.Property(m => m.Tags)
            .HasColumnType("jsonb")
            .HasConversion(tagsConverter)
            .HasDefaultValueSql("'[]'::jsonb");

        builder.Property(m => m.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamptz")
            .HasDefaultValueSql("NOW()");

        builder.Property(m => m.UpdatedAt)
            .IsRequired()
            .HasColumnType("timestamptz")
            .HasDefaultValueSql("NOW()");

        builder.HasOne<VendorProfile>()
            .WithMany()
            .HasForeignKey(m => m.VendorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
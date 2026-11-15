using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json;
using FoodTech.Domain.Entities;

namespace FoodTech.Infrastructure.Data.EntityConfigurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");

        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id)
            .HasColumnType("text")
            .HasDefaultValueSql("gen_random_uuid()::text")
            .ValueGeneratedOnAdd();

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);
        builder.HasIndex(o => o.OrderNumber)
            .IsUnique();

        builder.Property(o => o.EmployeeId)
            .IsRequired()
            .HasColumnType("text");
        builder.HasIndex(o => new { o.EmployeeId, o.CreatedAt });

        builder.Property(o => o.VendorId)
            .IsRequired()
            .HasColumnType("text");
        builder.HasIndex(o => new { o.VendorId, o.Status });
        builder.HasIndex(o => new { o.VendorId, o.CreatedAt });

        var itemsConverter = new ValueConverter<OrderItem[], string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            v => JsonSerializer.Deserialize<OrderItem[]>(v, (JsonSerializerOptions?)null) ?? Array.Empty<OrderItem>());

        builder.Property(o => o.Items)
            .HasColumnType("jsonb")
            .IsRequired()
            .HasConversion(itemsConverter);

        builder.Property(o => o.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasColumnType("text");
        builder.HasIndex(o => new { o.Status, o.CreatedAt });

        builder.Property(o => o.Subtotal)
            .IsRequired()
            .HasColumnType("bigint");

        builder.Property(o => o.TaxAmount)
            .IsRequired()
            .HasColumnType("bigint");

        builder.Property(o => o.DeliveryFee)
            .IsRequired()
            .HasColumnType("bigint");

        builder.Property(o => o.Total)
            .IsRequired()
            .HasColumnType("bigint");

        builder.Property(o => o.PaymentMethod)
            .IsRequired()
            .HasConversion<string>()
            .HasColumnType("text");

        builder.Property(o => o.PaymentStatus)
            .IsRequired()
            .HasConversion<string>()
            .HasColumnType("text");

        builder.Property(o => o.PaymentId)
            .HasMaxLength(100);
        builder.HasIndex(o => o.PaymentId)
            .IsUnique()
            .HasFilter("\"PaymentId\" IS NOT NULL");

        builder.Property(o => o.QrCodeData)
            .HasMaxLength(1000);

        builder.Property(o => o.Notes)
            .HasMaxLength(500);

        builder.Property(o => o.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamptz")
            .HasDefaultValueSql("NOW()");

        builder.Property(o => o.UpdatedAt)
            .IsRequired()
            .HasColumnType("timestamptz")
            .HasDefaultValueSql("NOW()");

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(o => o.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<VendorProfile>()
            .WithMany()
            .HasForeignKey(o => o.VendorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
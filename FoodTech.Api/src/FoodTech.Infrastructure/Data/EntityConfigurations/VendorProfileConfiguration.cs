using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FoodTech.Domain.Entities;

namespace FoodTech.Infrastructure.Data.EntityConfigurations;

public class VendorProfileConfiguration : IEntityTypeConfiguration<VendorProfile>
{
    public void Configure(EntityTypeBuilder<VendorProfile> builder)
    {
        builder.ToTable("vendor_profiles");

        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id)
            .HasColumnType("text")
            .HasDefaultValueSql("gen_random_uuid()::text")
            .ValueGeneratedOnAdd();

        builder.Property(v => v.UserId)
            .IsRequired()
            .HasColumnType("text");
        builder.HasIndex(v => v.UserId)
            .IsUnique();

        builder.Property(v => v.BusinessName)
            .IsRequired()
            .HasMaxLength(200);
        builder.HasIndex(v => v.BusinessName);

        builder.Property(v => v.GstNumber)
            .HasMaxLength(50);
        builder.HasIndex(v => v.GstNumber)
            .IsUnique()
            .HasFilter("\"GstNumber\" IS NOT NULL");

        builder.Property(v => v.Description)
            .HasMaxLength(1000);

        builder.Property(v => v.Address)
            .HasColumnType("jsonb")
            .IsRequired();

        builder.Property(v => v.OperatingHours)
            .HasColumnType("jsonb")
            .IsRequired();

        builder.Property(v => v.ImageUrl)
            .HasMaxLength(500);

        builder.Property(v => v.IsApproved)
            .IsRequired()
            .HasDefaultValue(false);
        builder.HasIndex(v => new { v.IsApproved, v.Rating });

        builder.Property(v => v.Rating)
            .HasPrecision(3, 2)
            .HasDefaultValue(0.0);

        builder.Property(v => v.TotalOrders)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(v => v.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamptz")
            .HasDefaultValueSql("NOW()");

        builder.Property(v => v.UpdatedAt)
            .IsRequired()
            .HasColumnType("timestamptz")
            .HasDefaultValueSql("NOW()");

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(v => v.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
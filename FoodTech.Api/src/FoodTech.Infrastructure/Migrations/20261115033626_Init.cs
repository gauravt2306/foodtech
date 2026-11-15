using System;
using FoodTech.Domain.Entities;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodTech.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:category", "breakfast,lunch,snacks,beverages,dinner")
                .Annotation("Npgsql:Enum:diet_type", "veg,non_veg,vegan,gluten_free")
                .Annotation("Npgsql:Enum:order_status", "pending,confirmed,preparing,ready,completed,cancelled")
                .Annotation("Npgsql:Enum:payment_method", "upi,cash")
                .Annotation("Npgsql:Enum:payment_status", "pending,paid,failed,refunded")
                .Annotation("Npgsql:Enum:user_role", "super_admin,vendor,employee");

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false, defaultValueSql: "gen_random_uuid()::text"),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    AvatarUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    VendorProfileId = table.Column<string>(type: "text", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamptz", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamptz", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "vendor_profiles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false, defaultValueSql: "gen_random_uuid()::text"),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    BusinessName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    GstNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Address = table.Column<Address>(type: "jsonb", nullable: false),
                    OperatingHours = table.Column<OperatingHours>(type: "jsonb", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsApproved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ApprovedBy = table.Column<string>(type: "text", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Rating = table.Column<double>(type: "double precision", precision: 3, scale: 2, nullable: false, defaultValue: 0.0),
                    TotalOrders = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                    CreatedAt = table.Column<DateTime>(type: "timestamptz", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamptz", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_profiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_vendor_profiles_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "menu_items",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false, defaultValueSql: "gen_random_uuid()::text"),
                    VendorId = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Price = table.Column<long>(type: "bigint", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    DietType = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    PrepTimeMinutes = table.Column<int>(type: "integer", nullable: false),
                    Tags = table.Column<string[]>(type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    CreatedAt = table.Column<DateTime>(type: "timestamptz", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamptz", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_menu_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_menu_items_vendor_profiles_VendorId",
                        column: x => x.VendorId,
                        principalTable: "vendor_profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false, defaultValueSql: "gen_random_uuid()::text"),
                    OrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EmployeeId = table.Column<string>(type: "text", nullable: false),
                    VendorId = table.Column<string>(type: "text", nullable: false),
                    Items = table.Column<OrderItem[]>(type: "jsonb", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Subtotal = table.Column<long>(type: "bigint", nullable: false),
                    TaxAmount = table.Column<long>(type: "bigint", nullable: false),
                    DeliveryFee = table.Column<long>(type: "bigint", nullable: false),
                    Total = table.Column<long>(type: "bigint", nullable: false),
                    PaymentMethod = table.Column<string>(type: "text", nullable: false),
                    PaymentStatus = table.Column<string>(type: "text", nullable: false),
                    PaymentId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    QrCodeData = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    HandoffAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HandoffBy = table.Column<string>(type: "text", nullable: true),
                    SpecialInstructions = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PickupTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamptz", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamptz", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_orders_users_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_orders_vendor_profiles_VendorId",
                        column: x => x.VendorId,
                        principalTable: "vendor_profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_menu_items_VendorId",
                table: "menu_items",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_menu_items_VendorId_Category",
                table: "menu_items",
                columns: new[] { "VendorId", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_menu_items_VendorId_DietType",
                table: "menu_items",
                columns: new[] { "VendorId", "DietType" });

            migrationBuilder.CreateIndex(
                name: "IX_menu_items_VendorId_IsAvailable",
                table: "menu_items",
                columns: new[] { "VendorId", "IsAvailable" });

            migrationBuilder.CreateIndex(
                name: "IX_orders_EmployeeId_CreatedAt",
                table: "orders",
                columns: new[] { "EmployeeId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_orders_OrderNumber",
                table: "orders",
                column: "OrderNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_orders_PaymentId",
                table: "orders",
                column: "PaymentId",
                unique: true,
                filter: "\"PaymentId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_orders_Status_CreatedAt",
                table: "orders",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_orders_VendorId_CreatedAt",
                table: "orders",
                columns: new[] { "VendorId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_orders_VendorId_Status",
                table: "orders",
                columns: new[] { "VendorId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                table: "users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_Phone",
                table: "users",
                column: "Phone",
                unique: true,
                filter: "\"Phone\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_users_Role_IsActive",
                table: "users",
                columns: new[] { "Role", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_vendor_profiles_BusinessName",
                table: "vendor_profiles",
                column: "BusinessName");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_profiles_GstNumber",
                table: "vendor_profiles",
                column: "GstNumber",
                unique: true,
                filter: "\"GstNumber\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_profiles_IsApproved_Rating",
                table: "vendor_profiles",
                columns: new[] { "IsApproved", "Rating" });

            migrationBuilder.CreateIndex(
                name: "IX_vendor_profiles_UserId",
                table: "vendor_profiles",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "menu_items");

            migrationBuilder.DropTable(
                name: "orders");

            migrationBuilder.DropTable(
                name: "vendor_profiles");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}

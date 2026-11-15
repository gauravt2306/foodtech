using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodTech.Infrastructure.FoodTech.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_vendor_profiles_GstNumber",
                table: "vendor_profiles");

            migrationBuilder.DropIndex(
                name: "IX_users_Phone",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_orders_PaymentId",
                table: "orders");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_profiles_GstNumber",
                table: "vendor_profiles",
                column: "GstNumber",
                unique: true,
                filter: "\"GstNumber\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_users_Phone",
                table: "users",
                column: "Phone",
                unique: true,
                filter: "\"Phone\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_orders_PaymentId",
                table: "orders",
                column: "PaymentId",
                unique: true,
                filter: "\"PaymentId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_vendor_profiles_GstNumber",
                table: "vendor_profiles");

            migrationBuilder.DropIndex(
                name: "IX_users_Phone",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_orders_PaymentId",
                table: "orders");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_profiles_GstNumber",
                table: "vendor_profiles",
                column: "GstNumber",
                unique: true,
                filter: "gst_number IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_users_Phone",
                table: "users",
                column: "Phone",
                unique: true,
                filter: "phone IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_orders_PaymentId",
                table: "orders",
                column: "PaymentId",
                unique: true,
                filter: "payment_id IS NOT NULL");
        }
    }
}

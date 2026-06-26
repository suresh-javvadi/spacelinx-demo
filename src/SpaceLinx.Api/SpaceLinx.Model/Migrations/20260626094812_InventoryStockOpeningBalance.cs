using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpaceLinx.Model.Migrations
{
    /// <inheritdoc />
    public partial class InventoryStockOpeningBalance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "opening_price",
                schema: "sc",
                table: "inventory_stock",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "opening_qty",
                schema: "sc",
                table: "inventory_stock",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "opening_price",
                schema: "sc",
                table: "inventory_stock");

            migrationBuilder.DropColumn(
                name: "opening_qty",
                schema: "sc",
                table: "inventory_stock");
        }
    }
}

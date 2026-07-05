using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpaceLinx.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddHsnCodeToInventoryEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "hsn_code",
                schema: "sc",
                table: "inventory_stock",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "hsn_code",
                schema: "sc",
                table: "inventory_part",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "hsn_code",
                schema: "sc",
                table: "grn_line_item",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "hsn_code",
                schema: "sc",
                table: "inventory_stock");

            migrationBuilder.DropColumn(
                name: "hsn_code",
                schema: "sc",
                table: "inventory_part");

            migrationBuilder.DropColumn(
                name: "hsn_code",
                schema: "sc",
                table: "grn_line_item");
        }
    }
}

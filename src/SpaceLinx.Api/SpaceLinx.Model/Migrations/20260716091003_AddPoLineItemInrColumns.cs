using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpaceLinx.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddPoLineItemInrColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "total_amount_in_inr",
                schema: "sc",
                table: "po_line_item",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                computedColumnSql: "((((ordered_quantity)::numeric * unit_price) * conversion_rate))::numeric(18,4)",
                stored: true);

            migrationBuilder.AddColumn<decimal>(
                name: "unit_price_in_inr",
                schema: "sc",
                table: "po_line_item",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true,
                computedColumnSql: "((unit_price * conversion_rate))::numeric(18,4)",
                stored: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "total_amount_in_inr",
                schema: "sc",
                table: "po_line_item");

            migrationBuilder.DropColumn(
                name: "unit_price_in_inr",
                schema: "sc",
                table: "po_line_item");
        }
    }
}

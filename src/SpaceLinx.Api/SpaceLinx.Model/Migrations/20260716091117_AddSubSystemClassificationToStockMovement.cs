using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpaceLinx.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddSubSystemClassificationToStockMovement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "classification",
                schema: "sc",
                table: "stock_movement",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "platform_payload_sdr",
                schema: "sc",
                table: "stock_movement",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "sub_system",
                schema: "sc",
                table: "stock_movement",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "classification",
                schema: "sc",
                table: "stock_movement");

            migrationBuilder.DropColumn(
                name: "platform_payload_sdr",
                schema: "sc",
                table: "stock_movement");

            migrationBuilder.DropColumn(
                name: "sub_system",
                schema: "sc",
                table: "stock_movement");
        }
    }
}

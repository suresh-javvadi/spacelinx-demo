using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpaceLinx.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddOpeningDateToInventoryStock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "opening_date",
                schema: "sc",
                table: "inventory_stock",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "opening_date",
                schema: "sc",
                table: "inventory_stock");
        }
    }
}

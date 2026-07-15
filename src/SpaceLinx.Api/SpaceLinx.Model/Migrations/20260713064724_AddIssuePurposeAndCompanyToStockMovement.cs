using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpaceLinx.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddIssuePurposeAndCompanyToStockMovement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "company_id",
                schema: "sc",
                table: "stock_movement",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "issue_purpose",
                schema: "sc",
                table: "stock_movement",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_movement_company_id",
                schema: "sc",
                table: "stock_movement",
                column: "company_id");

            migrationBuilder.AddForeignKey(
                name: "stock_movement_company_id_fkey",
                schema: "sc",
                table: "stock_movement",
                column: "company_id",
                principalSchema: "sc",
                principalTable: "company",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "stock_movement_company_id_fkey",
                schema: "sc",
                table: "stock_movement");

            migrationBuilder.DropIndex(
                name: "IX_stock_movement_company_id",
                schema: "sc",
                table: "stock_movement");

            migrationBuilder.DropColumn(
                name: "company_id",
                schema: "sc",
                table: "stock_movement");

            migrationBuilder.DropColumn(
                name: "issue_purpose",
                schema: "sc",
                table: "stock_movement");
        }
    }
}

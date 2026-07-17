using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpaceLinx.Model.Migrations
{
    /// <inheritdoc />
    public partial class ChangePoLineItemCurrencyToCurrencyId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "currency_id",
                schema: "sc",
                table: "po_line_item",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE sc.po_line_item pli 
                SET currency_id = c.id
                FROM common.currency c 
                WHERE c.code = pli.currency;
            ");

            migrationBuilder.DropColumn(
                name: "currency",
                schema: "sc",
                table: "po_line_item");

            migrationBuilder.CreateIndex(
                name: "IX_po_line_item_currency_id",
                schema: "sc",
                table: "po_line_item",
                column: "currency_id");

            migrationBuilder.AddForeignKey(
                name: "po_line_item_currency_id_fkey",
                schema: "sc",
                table: "po_line_item",
                column: "currency_id",
                principalSchema: "common",
                principalTable: "currency",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "currency",
                schema: "sc",
                table: "po_line_item",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE sc.po_line_item pli 
                SET currency = c.code
                FROM common.currency c 
                WHERE c.id = pli.currency_id;
            ");

            migrationBuilder.DropForeignKey(
                name: "po_line_item_currency_id_fkey",
                schema: "sc",
                table: "po_line_item");

            migrationBuilder.DropIndex(
                name: "IX_po_line_item_currency_id",
                schema: "sc",
                table: "po_line_item");

            migrationBuilder.DropColumn(
                name: "currency_id",
                schema: "sc",
                table: "po_line_item");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpaceLinx.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddSubProject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "sub_project_id",
                schema: "sc",
                table: "stock_movement",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "sub_project",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    sub_project_code = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "pm.generate_project_code()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    project_id = table.Column<Guid>(type: "uuid", nullable: false),
                    program_id = table.Column<Guid>(type: "uuid", nullable: true),
                    project_manager_id = table.Column<Guid>(type: "uuid", nullable: true),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    budget = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("sub_project_pkey", x => x.id);
                    table.ForeignKey(
                        name: "sub_project_program_id_fkey",
                        column: x => x.program_id,
                        principalSchema: "pm",
                        principalTable: "program",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "sub_project_project_id_fkey",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "project",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "sub_project_project_manager_id_fkey",
                        column: x => x.project_manager_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_stock_movement_sub_project_id",
                schema: "sc",
                table: "stock_movement",
                column: "sub_project_id");

            migrationBuilder.CreateIndex(
                name: "IX_sub_project_program_id",
                schema: "pm",
                table: "sub_project",
                column: "program_id");

            migrationBuilder.CreateIndex(
                name: "IX_sub_project_project_id",
                schema: "pm",
                table: "sub_project",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_sub_project_project_manager_id",
                schema: "pm",
                table: "sub_project",
                column: "project_manager_id");

            migrationBuilder.AddForeignKey(
                name: "stock_movement_sub_project_id_fkey",
                schema: "sc",
                table: "stock_movement",
                column: "sub_project_id",
                principalSchema: "pm",
                principalTable: "sub_project",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "stock_movement_sub_project_id_fkey",
                schema: "sc",
                table: "stock_movement");

            migrationBuilder.DropTable(
                name: "sub_project",
                schema: "pm");

            migrationBuilder.DropIndex(
                name: "IX_stock_movement_sub_project_id",
                schema: "sc",
                table: "stock_movement");

            migrationBuilder.DropColumn(
                name: "sub_project_id",
                schema: "sc",
                table: "stock_movement");
        }
    }
}

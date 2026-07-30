using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpaceLinx.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddIsMsmeCertifiedToCompany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_msme_certified",
                schema: "sc",
                table: "company",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "company_msme_check",
                schema: "sc",
                table: "company",
                sql: "(is_vendor = true) OR (is_msme_certified IS NULL)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "company_msme_check",
                schema: "sc",
                table: "company");

            migrationBuilder.DropColumn(
                name: "is_msme_certified",
                schema: "sc",
                table: "company");
        }
    }
}

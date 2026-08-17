using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpaceLinx.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPasswordAuth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "failed_login_attempts",
                schema: "application",
                table: "user",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "lockout_until",
                schema: "application",
                table: "user",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "must_change_password",
                schema: "application",
                table: "user",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "password_hash",
                schema: "application",
                table: "user",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "password_reset_token_expires_at",
                schema: "application",
                table: "user",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "password_reset_token_hash",
                schema: "application",
                table: "user",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "password_updated_at",
                schema: "application",
                table: "user",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "failed_login_attempts",
                schema: "application",
                table: "user");

            migrationBuilder.DropColumn(
                name: "lockout_until",
                schema: "application",
                table: "user");

            migrationBuilder.DropColumn(
                name: "must_change_password",
                schema: "application",
                table: "user");

            migrationBuilder.DropColumn(
                name: "password_hash",
                schema: "application",
                table: "user");

            migrationBuilder.DropColumn(
                name: "password_reset_token_expires_at",
                schema: "application",
                table: "user");

            migrationBuilder.DropColumn(
                name: "password_reset_token_hash",
                schema: "application",
                table: "user");

            migrationBuilder.DropColumn(
                name: "password_updated_at",
                schema: "application",
                table: "user");
        }
    }
}

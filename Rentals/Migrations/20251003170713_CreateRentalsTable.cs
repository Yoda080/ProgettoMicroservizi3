using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Rentals.Migrations
{
    /// <inheritdoc />
    public partial class CreateRentalsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.CreateTable(
                name: "rentals_db",
                schema: "dbo",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    movie_id = table.Column<int>(type: "int", nullable: false),
                    rented_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    due_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    returned_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    total_price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rentals_db", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "rentals_db",
                schema: "dbo");
        }
    }
}

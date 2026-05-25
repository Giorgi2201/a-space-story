using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Story.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMissionProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MissionProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    MissionKey = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    CurrentChapter = table.Column<int>(type: "integer", nullable: false),
                    Phase = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    NarrativeSegmentIndex = table.Column<int>(type: "integer", nullable: false),
                    LastCompletedChapter = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MissionProgresses", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MissionProgresses_UserId_MissionKey",
                table: "MissionProgresses",
                columns: new[] { "UserId", "MissionKey" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MissionProgresses");
        }
    }
}

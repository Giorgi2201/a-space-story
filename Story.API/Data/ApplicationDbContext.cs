using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Story.API.Models;

namespace Story.API.Data;

public sealed class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<MissionProgress> MissionProgresses => Set<MissionProgress>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<MissionProgress>(entity =>
        {
            entity.HasIndex(progress => new { progress.UserId, progress.MissionKey }).IsUnique();
            entity.Property(progress => progress.MissionKey).HasMaxLength(64);
            entity.Property(progress => progress.Phase).HasMaxLength(32);
        });
    }
}
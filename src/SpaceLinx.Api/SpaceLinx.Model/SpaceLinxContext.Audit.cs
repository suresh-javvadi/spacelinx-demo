using Microsoft.EntityFrameworkCore;

namespace SpaceLinx.Model;

/// <summary>
/// Audit-trail mapping, kept out of the scaffolded <see cref="SpaceLinxContext"/> file.
/// Implements the scaffolded <c>OnModelCreatingPartial</c> hook so it composes without
/// editing the generated context. The physical table is created by the offline SQL
/// migration <c>database/migrations/migration_audit_change_log.sql</c> (range-partitioned),
/// so only the runtime mapping lives here.
/// </summary>
public partial class SpaceLinxContext
{
    public virtual DbSet<ChangeLog> ChangeLogs { get; set; }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ChangeLog>(entity =>
        {
            // EF tracking key is the identity surrogate; the physical PK is (id, occurred_at)
            // for partitioning. EF only ever inserts into this table, so a single-column key is fine.
            entity.HasKey(e => e.Id);

            entity.ToTable("change_log", "audit");

            entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
            entity.Property(e => e.OccurredAt).HasColumnName("occurred_at");
            entity.Property(e => e.SchemaName).HasColumnName("schema_name").HasMaxLength(63);
            entity.Property(e => e.TableName).HasColumnName("table_name").HasMaxLength(128);
            entity.Property(e => e.EntityType).HasColumnName("entity_type").HasMaxLength(128);
            entity.Property(e => e.RowPk).HasColumnName("row_pk");
            entity.Property(e => e.Operation).HasColumnName("operation").HasMaxLength(20);
            entity.Property(e => e.OldValues).HasColumnName("old_values").HasColumnType("jsonb");
            entity.Property(e => e.NewValues).HasColumnName("new_values").HasColumnType("jsonb");
            entity.Property(e => e.ChangedColumns).HasColumnName("changed_cols");
            entity.Property(e => e.ActorEmail).HasColumnName("actor_email").HasMaxLength(255);
            entity.Property(e => e.ActorRoleId).HasColumnName("actor_role_id");
            entity.Property(e => e.AuthorizedBy).HasColumnName("authorized_by").HasMaxLength(255);
            entity.Property(e => e.Bypass).HasColumnName("bypass");
            entity.Property(e => e.AppName).HasColumnName("app_name").HasMaxLength(50);
            entity.Property(e => e.TenantId).HasColumnName("tenant_id").HasMaxLength(100);
            entity.Property(e => e.CorrelationId).HasColumnName("correlation_id").HasMaxLength(100);
            entity.Property(e => e.RequestPath).HasColumnName("request_path").HasMaxLength(500);
            entity.Property(e => e.RequestMethod).HasColumnName("request_method").HasMaxLength(10);
            entity.Property(e => e.SourceIp).HasColumnName("source_ip").HasMaxLength(64);
            entity.Property(e => e.UserAgent).HasColumnName("user_agent").HasMaxLength(512);
            entity.Property(e => e.Success).HasColumnName("success");
            entity.Property(e => e.Source).HasColumnName("source").HasMaxLength(1);
        });
    }
}

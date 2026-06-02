using System.Collections.Concurrent;
using System.Diagnostics;
using System.Reflection;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Audit;

/// <summary>
/// Platform-wide audit interceptor. On <c>SavingChanges</c> it (1) centralizes the
/// Created/Updated/Deleted stamping for every <see cref="BaseModel"/> entity and (2) captures a
/// field-level diff of each insert/update/delete. On <c>SavedChanges</c> it writes the captured
/// rows to <c>audit.change_log</c> via a child scope (a separate transaction, so an audit-store
/// problem never rolls back business data — gaps are logged instead). Hard deletes are recorded
/// (no silent physical deletes) but delete behaviour is not changed here.
/// </summary>
public sealed class SpaceLinxAuditInterceptor : SaveChangesInterceptor
{
    private readonly IHttpContextAccessor _http;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SpaceLinxAuditInterceptor> _logger;

    // Caches keyed by CLR type — reflection is done once per type.
    private static readonly ConcurrentDictionary<Type, AuditOperations?> ExcludeCache = new();
    private static readonly ConcurrentDictionary<(Type, string), bool> RedactCache = new();

    // Fail-closed backstop: any un-annotated property whose name matches is redacted.
    private static readonly Regex SensitiveName = new(
        "pass|pwd|secret|token|apikey|api_key|connection_?string|private_?key|client_?secret|authorization|cookie|credential",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    // Per SaveChanges call, keyed by the DbContext instance, so pooled contexts never bleed.
    private readonly ConcurrentDictionary<DbContextId, List<PendingAudit>> _pending = new();

    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = false };

    public SpaceLinxAuditInterceptor(
        IHttpContextAccessor http,
        IServiceScopeFactory scopeFactory,
        ILogger<SpaceLinxAuditInterceptor> logger)
    {
        _http = http;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    // ---- Capture (SavingChanges) ------------------------------------------------------------

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData, InterceptionResult<int> result)
    {
        Capture(eventData.Context);
        return result;
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        Capture(eventData.Context);
        return new ValueTask<InterceptionResult<int>>(result);
    }

    // ---- Flush (SavedChanges / SaveChangesFailed) -------------------------------------------

    public override int SavedChanges(SaveChangesCompletedEventData eventData, int result)
    {
        Flush(eventData.Context, success: true);
        return result;
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData, int result, CancellationToken cancellationToken = default)
    {
        await FlushAsync(eventData.Context, success: true, cancellationToken);
        return result;
    }

    public override void SaveChangesFailed(DbContextErrorEventData eventData)
        => Flush(eventData.Context, success: false);

    public override System.Threading.Tasks.Task SaveChangesFailedAsync(DbContextErrorEventData eventData, CancellationToken cancellationToken = default)
        => FlushAsync(eventData.Context, success: false, cancellationToken);

    // ---- Capture implementation -------------------------------------------------------------

    private void Capture(DbContext? context)
    {
        if (context is null)
        {
            return;
        }

        var actor = ResolveActor();
        var pendings = new List<PendingAudit>();

        foreach (var entry in context.ChangeTracker.Entries())
        {
            if (entry.Entity is not BaseModel model)
            {
                continue; // only audit BaseModel entities (ChangeLog and log/ledger types are skipped)
            }

            var state = entry.State;
            if (state is not (EntityState.Added or EntityState.Modified or EntityState.Deleted))
            {
                continue;
            }

            Stamp(entry, model, state, actor.Email);

            if (IsExcluded(entry.Entity.GetType(), state))
            {
                continue;
            }

            var (oldValues, newValues, changed) = BuildDiff(entry, state);

            // A "Modified" entry whose only change was our own stamping with no real column delta
            // still has changed columns (UpdatedAt/By) — keep it: it is a genuine update.
            var log = new ChangeLog
            {
                OccurredAt = DateTime.UtcNow,
                SchemaName = entry.Metadata.GetSchema() ?? "public",
                TableName = entry.Metadata.GetTableName() ?? entry.Entity.GetType().Name,
                EntityType = entry.Entity.GetType().Name,
                RowPk = model.Id ?? Guid.Empty,
                Operation = MapOperation(entry, state),
                OldValues = oldValues,
                NewValues = newValues,
                ChangedColumns = changed,
                ActorEmail = actor.Email,
                ActorRoleId = actor.RoleId,
                AppName = actor.AppName,
                TenantId = actor.TenantId,
                CorrelationId = actor.CorrelationId,
                RequestPath = actor.Path,
                RequestMethod = actor.Method,
                SourceIp = actor.Ip,
                UserAgent = actor.UserAgent,
                Source = "A",
                Success = true
            };

            pendings.Add(new PendingAudit(log, model, generatedId: state == EntityState.Added));
        }

        if (pendings.Count > 0)
        {
            _pending[context.ContextId] = pendings;
        }
    }

    private static void Stamp(EntityEntry entry, BaseModel model, EntityState state, string actorEmail)
    {
        var now = DateTime.UtcNow;
        switch (state)
        {
            case EntityState.Added:
                // Added rows insert every property, so a direct CLR set is sufficient.
                if (string.IsNullOrWhiteSpace(model.CreatedBy))
                {
                    model.CreatedBy = actorEmail;
                }
                if (model.CreatedAt == default)
                {
                    model.CreatedAt = now;
                }
                break;

            case EntityState.Modified:
                // Set through the entry so the properties are marked modified and persisted
                // (DetectChanges has already run by the time this interceptor fires).
                entry.Property(nameof(BaseModel.UpdatedAt)).CurrentValue = now;
                entry.Property(nameof(BaseModel.UpdatedBy)).CurrentValue = actorEmail;
                break;
        }
    }

    private static string MapOperation(EntityEntry entry, EntityState state)
    {
        switch (state)
        {
            case EntityState.Added:
                return "INSERT";
            case EntityState.Deleted:
                return "HARD_DELETE";
            default:
                var deletedAt = entry.Properties.FirstOrDefault(p => p.Metadata.Name == nameof(BaseModel.DeletedAt));
                if (deletedAt is { IsModified: true, CurrentValue: not null } && deletedAt.OriginalValue is null)
                {
                    return "SOFT_DELETE";
                }
                return "UPDATE";
        }
    }

    private (string? oldValues, string? newValues, string[]? changed) BuildDiff(EntityEntry entry, EntityState state)
    {
        var type = entry.Entity.GetType();

        switch (state)
        {
            case EntityState.Added:
            {
                var values = new Dictionary<string, object?>();
                foreach (var p in entry.Properties)
                {
                    values[p.Metadata.Name] = Value(type, p.Metadata.Name, p.CurrentValue);
                }
                return (null, Serialize(values), null);
            }
            case EntityState.Deleted:
            {
                var values = new Dictionary<string, object?>();
                foreach (var p in entry.Properties)
                {
                    values[p.Metadata.Name] = Value(type, p.Metadata.Name, p.OriginalValue);
                }
                return (Serialize(values), null, null);
            }
            default:
            {
                var oldValues = new Dictionary<string, object?>();
                var newValues = new Dictionary<string, object?>();
                var changed = new List<string>();
                foreach (var p in entry.Properties)
                {
                    if (!p.IsModified)
                    {
                        continue;
                    }
                    var name = p.Metadata.Name;
                    changed.Add(name);
                    oldValues[name] = Value(type, name, p.OriginalValue);
                    newValues[name] = Value(type, name, p.CurrentValue);
                }
                if (changed.Count == 0)
                {
                    return (null, null, null);
                }
                return (Serialize(oldValues), Serialize(newValues), changed.ToArray());
            }
        }
    }

    private static object? Value(Type type, string propertyName, object? value)
        => ShouldRedact(type, propertyName) ? "[REDACTED]" : value;

    private static string Serialize(Dictionary<string, object?> values)
        => JsonSerializer.Serialize(values, JsonOptions);

    private static bool ShouldRedact(Type type, string propertyName)
        => RedactCache.GetOrAdd((type, propertyName), key =>
        {
            var prop = key.Item1.GetProperty(
                key.Item2, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
            if (prop?.GetCustomAttribute<AuditRedactAttribute>() is not null)
            {
                return true;
            }
            return SensitiveName.IsMatch(key.Item2);
        });

    private static bool IsExcluded(Type type, EntityState state)
    {
        var ops = ExcludeCache.GetOrAdd(type, t => t.GetCustomAttribute<AuditExcludeAttribute>()?.Operations);
        if (ops is null)
        {
            return false;
        }
        var flag = state switch
        {
            EntityState.Added => AuditOperations.Insert,
            EntityState.Modified => AuditOperations.Update,
            EntityState.Deleted => AuditOperations.Delete,
            _ => AuditOperations.None
        };
        return flag != AuditOperations.None && ops.Value.HasFlag(flag);
    }

    // ---- Flush implementation ---------------------------------------------------------------

    private void Flush(DbContext? context, bool success)
    {
        var logs = TakePending(context, success);
        if (logs is null)
        {
            return;
        }
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var ctx = scope.ServiceProvider.GetRequiredService<SpaceLinxContext>();
            ctx.ChangeLogs.AddRange(logs);
            ctx.SaveChanges();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Audit write failed for {Count} change(s); business data is preserved.", logs.Count);
        }
    }

    private async System.Threading.Tasks.Task FlushAsync(DbContext? context, bool success, CancellationToken cancellationToken)
    {
        var logs = TakePending(context, success);
        if (logs is null)
        {
            return;
        }
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var ctx = scope.ServiceProvider.GetRequiredService<SpaceLinxContext>();
            ctx.ChangeLogs.AddRange(logs);
            await ctx.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Audit write failed for {Count} change(s); business data is preserved.", logs.Count);
        }
    }

    private List<ChangeLog>? TakePending(DbContext? context, bool success)
    {
        if (context is null || !_pending.TryRemove(context.ContextId, out var pendings) || pendings.Count == 0)
        {
            return null;
        }
        foreach (var p in pendings)
        {
            if (p.GeneratedId)
            {
                p.Log.RowPk = p.Entity.Id ?? Guid.Empty; // DB-generated PKs are known only after save
            }
            if (!success)
            {
                p.Log.Success = false;
            }
        }
        return pendings.Select(p => p.Log).ToList();
    }

    // ---- Actor resolution -------------------------------------------------------------------

    private ActorInfo ResolveActor()
    {
        var ctx = _http.HttpContext;
        if (ctx is null)
        {
            return new ActorInfo(
                AuditConstants.SystemActor, null, null, null,
                Activity.Current?.TraceId.ToString(), null, null, null, null);
        }

        var email = ctx.User?.Identity?.Name
            ?? ctx.User?.Claims?.FirstOrDefault(c => c.Type == "preferred_username")?.Value;
        email = string.IsNullOrWhiteSpace(email) ? AuditConstants.SystemActor : email.ToLowerInvariant();

        Guid? roleId = Guid.TryParse(ctx.Request.Headers["roleId"], out var parsed) ? parsed : null;
        var appName = ctx.Request.Headers[SpaceLinxConstants.SpaceLinxAppHeaderKey].FirstOrDefault();
        var correlationId = ctx.Items.TryGetValue(AuditConstants.CorrelationItemKey, out var cv) && cv is string s
            ? s
            : Activity.Current?.TraceId.ToString() ?? ctx.TraceIdentifier;

        return new ActorInfo(
            email,
            roleId,
            appName,
            TenantId: null,
            correlationId,
            ctx.Request.Path.Value,
            ctx.Request.Method,
            ctx.Connection.RemoteIpAddress?.ToString(),
            ctx.Request.Headers.UserAgent.FirstOrDefault());
    }

    private sealed record ActorInfo(
        string Email, Guid? RoleId, string? AppName, string? TenantId,
        string? CorrelationId, string? Path, string? Method, string? Ip, string? UserAgent);

    private sealed class PendingAudit
    {
        public PendingAudit(ChangeLog log, BaseModel entity, bool generatedId)
        {
            Log = log;
            Entity = entity;
            GeneratedId = generatedId;
        }

        public ChangeLog Log { get; }
        public BaseModel Entity { get; }
        public bool GeneratedId { get; }
    }
}

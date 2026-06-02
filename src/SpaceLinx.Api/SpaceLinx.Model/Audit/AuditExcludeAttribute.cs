namespace SpaceLinx.Model;

/// <summary>Operations that can be excluded from auditing for an entity.</summary>
[Flags]
public enum AuditOperations
{
    None = 0,
    Insert = 1,
    Update = 2,
    Delete = 4,
    All = Insert | Update | Delete
}

/// <summary>
/// Excludes an entity from the platform audit trail for the specified operations.
/// Apply to log/ledger entities that are their own record of truth (e.g. immutable
/// stock ledgers) to avoid double-auditing and write amplification.
/// </summary>
[AttributeUsage(AttributeTargets.Class, Inherited = true, AllowMultiple = false)]
public sealed class AuditExcludeAttribute : Attribute
{
    public AuditOperations Operations { get; }

    public AuditExcludeAttribute(AuditOperations operations = AuditOperations.All)
        => Operations = operations;
}

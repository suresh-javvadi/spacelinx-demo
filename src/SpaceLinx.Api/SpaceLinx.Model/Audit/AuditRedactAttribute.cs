namespace SpaceLinx.Model;

/// <summary>
/// Marks an entity property whose value must never appear in the audit trail.
/// The audit diff stores <c>[REDACTED]</c> in place of the value. Apply to
/// secrets, tokens, password hashes, connection strings and similar sensitive fields.
/// A property-name denylist provides a fail-closed backstop for un-annotated fields.
/// </summary>
[AttributeUsage(AttributeTargets.Property, Inherited = true, AllowMultiple = false)]
public sealed class AuditRedactAttribute : Attribute
{
}

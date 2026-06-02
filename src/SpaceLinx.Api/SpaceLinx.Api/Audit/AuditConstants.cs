namespace SpaceLinx.Api.Audit;

public static class AuditConstants
{
    /// <summary><see cref="HttpContext.Items"/> key holding the request correlation id.</summary>
    public const string CorrelationItemKey = "slx.correlationId";

    /// <summary>Actor recorded for changes made outside an HTTP request (background services).</summary>
    public const string SystemActor = "system@spacelinx.internal";
}

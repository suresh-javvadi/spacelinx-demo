using System.Diagnostics;
using Serilog.Context;
using SpaceLinx.Api.Audit;

namespace SpaceLinx.Api.Middleware;

/// <summary>
/// Establishes a request correlation id (from the inbound <c>X-Correlation-ID</c> header,
/// the current <see cref="Activity"/> trace id, or a new GUID), exposes it on
/// <see cref="HttpContext.Items"/> for the audit interceptor, echoes it on the response,
/// and pushes it onto the Serilog log context so audit rows and log lines share one id.
/// </summary>
public class CorrelationMiddleware
{
    public const string HeaderName = "X-Correlation-ID";

    private readonly RequestDelegate _next;

    public CorrelationMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers[HeaderName].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(correlationId))
        {
            correlationId = Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("N");
        }

        context.Items[AuditConstants.CorrelationItemKey] = correlationId;

        context.Response.OnStarting(() =>
        {
            context.Response.Headers[HeaderName] = correlationId;
            return Task.CompletedTask;
        });

        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}

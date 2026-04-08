using System.Net;
using System.Text.Json;
using Npgsql;
using SpaceLinx.Api.Models;

namespace SpaceLinx.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;
        var requestPath = context.Request.Path;
        var requestMethod = context.Request.Method;
        var userEmail = GetUserEmail(context);

        var (statusCode, message) = GetStatusCodeAndMessage(exception);

        _logger.LogError(
            exception,
            "Unhandled exception occurred. TraceId: {TraceId}, Method: {Method}, Path: {Path}, User: {User}, StatusCode: {StatusCode}, Message: {Message}",
            traceId,
            requestMethod,
            requestPath,
            userEmail,
            statusCode,
            message);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var response = new ApiErrorResponse
        {
            StatusCode = statusCode,
            Message = message,
            TraceId = traceId,
            Details = _environment.IsDevelopment() ? exception.ToString() : null
        };

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }

    private static (int StatusCode, string Message) GetStatusCodeAndMessage(Exception exception)
    {
        return exception switch
        {
            ApplicationException appEx => ((int)HttpStatusCode.BadRequest, appEx.Message),
            PostgresException pgEx => ((int)HttpStatusCode.BadRequest, pgEx.MessageText ?? "Database error occurred"),
            InvalidOperationException invOpEx => ((int)HttpStatusCode.BadRequest, invOpEx.Message),
            KeyNotFoundException => ((int)HttpStatusCode.NotFound, "Resource not found"),
            UnauthorizedAccessException => ((int)HttpStatusCode.Forbidden, "Access denied"),
            ArgumentException argEx => ((int)HttpStatusCode.BadRequest, argEx.Message),
            _ => ((int)HttpStatusCode.InternalServerError, "An unexpected error occurred")
        };
    }

    private static string GetUserEmail(HttpContext context)
    {
        var user = context.User;
        if (user?.Identity?.IsAuthenticated == true)
        {
            return user.Identity.Name
                ?? user.Claims.FirstOrDefault(c => c.Type == "preferred_username")?.Value
                ?? "Unknown";
        }
        return "Anonymous";
    }
}

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using FoodTech.Api.Models;

namespace FoodTech.Api.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
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

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var requestId = context.Items["RequestId"]?.ToString() ?? "unknown";
        var path = context.Request.Path;

        _logger.LogError(ex, "Unhandled exception for {Method} {Path} {{RequestId: {RequestId}}}",
            context.Request.Method, path, requestId);

        HttpStatusCode statusCode;
        string code;
        string message;
        Dictionary<string, string[]>? details = null;

        if (ex is UnauthorizedAccessException)
        {
            statusCode = HttpStatusCode.Unauthorized;
            code = "UNAUTHORIZED";
            message = ex.Message;
        }
        else if (ex is InvalidOperationException)
        {
            statusCode = HttpStatusCode.BadRequest;
            code = "BAD_REQUEST";
            message = ex.Message;
        }
        else if (ex is ArgumentException)
        {
            statusCode = HttpStatusCode.BadRequest;
            code = "VALIDATION_ERROR";
            message = ex.Message;
        }
        else if (ex is KeyNotFoundException)
        {
            statusCode = HttpStatusCode.NotFound;
            code = "NOT_FOUND";
            message = ex.Message;
        }
        else
        {
            statusCode = HttpStatusCode.InternalServerError;
            code = "INTERNAL_ERROR";
            message = _env.IsDevelopment() ? ex.Message : "Internal server error";
        }

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = ApiResponse<object>.Error(code, message, path, details);
        response.Meta.Timestamp = DateTime.UtcNow.ToString("o");

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}

public static class ErrorHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseErrorHandling(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ErrorHandlingMiddleware>();
    }
}
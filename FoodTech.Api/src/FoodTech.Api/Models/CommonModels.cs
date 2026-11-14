namespace FoodTech.Api.Models;

public record ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public ErrorResponse? ErrorInfo { get; init; }
    public MetaResponse Meta { get; init; } = new();

    public static ApiResponse<T> Ok(T data, string path = "")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Meta = new MetaResponse { Path = path }
        };
    }

    public static ApiResponse<T> Error(string code, string message, string path = "", Dictionary<string, string[]>? details = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            ErrorInfo = new ErrorResponse
            {
                Code = code,
                Message = message,
                Details = details
            },
            Meta = new MetaResponse { Path = path }
        };
    }
}

public record ErrorResponse
{
    public string Code { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public Dictionary<string, string[]>? Details { get; init; }
}

public class MetaResponse
{
    public string Timestamp { get; set; } = DateTime.UtcNow.ToString("o");
    public string Path { get; set; } = string.Empty;
}

public record HealthResponse(
    string Status,
    string Version,
    DateTime Timestamp,
    bool DatabaseConnected
);
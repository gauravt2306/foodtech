using Serilog;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text;
using System.Reflection;
using System.IO;
using FoodTech.Infrastructure;
using FoodTech.Infrastructure.Auth;
using FoodTech.Infrastructure.Data;
using FoodTech.Api.Middleware;
using FoodTech.Api.Validators;
using FluentValidation;
using Mapster;

var builder = WebApplication.CreateBuilder(args);

// Map Fly.io DATABASE_URL to PostgreSql:ConnectionString for Infrastructure
var databaseUrl = builder.Configuration["DATABASE_URL"];
if (!string.IsNullOrEmpty(databaseUrl))
{
    builder.Configuration["PostgreSql:ConnectionString"] = databaseUrl;
}

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "FoodTech.Api")
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Add FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

// Add Mapster
TypeAdapterConfig.GlobalSettings.Scan(typeof(Program).Assembly);

// Configure JWT Settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));

// Configure JWT Authentication - defer TokenValidationParameters configuration until after build
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role,
            NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("VendorOnly", policy => policy.RequireRole("vendor"));
    options.AddPolicy("EmployeeOnly", policy => policy.RequireRole("employee"));
    options.AddPolicy("SuperAdminOnly", policy => policy.RequireRole("superadmin"));
});

// Add Infrastructure services
builder.Services.AddInfrastructure(builder.Configuration);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add Health Checks with PostgreSQL
// Fly.io sets DATABASE_URL, also support ConnectionStrings:PostgreSql and PostgreSql:ConnectionString
var pgConnectionString = builder.Configuration.GetConnectionString("PostgreSql")
    ?? builder.Configuration["PostgreSql:ConnectionString"]
    ?? builder.Configuration["DATABASE_URL"]
    ?? throw new InvalidOperationException("PostgreSQL connection string not configured (checked ConnectionStrings:PostgreSql, PostgreSql:ConnectionString, DATABASE_URL)");

builder.Services.AddHealthChecks()
    .AddNpgSql(pgConnectionString);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FoodTech API",
        Version = "v1",
        Description = "FoodTech Backend API",
        Contact = new OpenApiContact { Name = "FoodTech Team", Email = "support@foodtech.com" }
    });

    // Include XML comments
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // Add JWT Bearer security scheme
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
    });

    // Add global security requirement using scheme reference
    c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference("Bearer"), new List<string>() }
    });

    // Add operation filter to apply security requirements based on [Authorize] / [AllowAnonymous]
    c.OperationFilter<SecurityRequirementsOperationFilter>();
});

var app = builder.Build();

// Initialize Database (run migrations)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
}

// Configure JWT Bearer options with validated settings from DI container
using (var scope = app.Services.CreateScope())
{
    var jwtSettings = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<JwtSettings>>().Value;
    var jwtBearerOptions = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptionsMonitor<JwtBearerOptions>>().Get(JwtBearerDefaults.AuthenticationScheme);
    jwtBearerOptions.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = System.Security.Claims.ClaimTypes.Role,
        NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier
    };
}

// Configure the HTTP request pipeline - Swagger available in all environments
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FoodTech API v1");
    c.RoutePrefix = "swagger";
    c.OAuthClientId("swagger-ui");
    c.OAuthAppName("FoodTech API Swagger UI");
    c.OAuthUsePkce();
});

// Custom middleware pipeline
app.UseRequestId();
app.UseRequestLogging();
app.UseErrorHandling();

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

// Listen on all interfaces for emulator access
app.Urls.Add("http://0.0.0.0:5083");

app.Run();

public partial class Program { } // For testing

// Operation filter to apply security requirements based on [Authorize] / [AllowAnonymous] attributes
internal sealed class SecurityRequirementsOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Check for [AllowAnonymous] on action or controller
        var hasAllowAnonymous = context.MethodInfo.GetCustomAttributes(true)
            .Union(context.MethodInfo.DeclaringType?.GetCustomAttributes(true) ?? Array.Empty<object>())
            .Any(a => a is AllowAnonymousAttribute);

        if (hasAllowAnonymous)
        {
            // Remove security requirement for anonymous endpoints
            operation.Security?.Clear();
            return;
        }

        // Check for [Authorize] on action or controller
        var hasAuthorize = context.MethodInfo.GetCustomAttributes(true)
            .Union(context.MethodInfo.DeclaringType?.GetCustomAttributes(true) ?? Array.Empty<object>())
            .Any(a => a is AuthorizeAttribute);

        if (hasAuthorize)
        {
            // Add Bearer security requirement - reference the scheme defined in AddSecurityDefinition
            operation.Security = new List<OpenApiSecurityRequirement>
            {
                new OpenApiSecurityRequirement
                {
                    { new OpenApiSecuritySchemeReference("Bearer"), new List<string>() }
                }
            };
        }
    }
}
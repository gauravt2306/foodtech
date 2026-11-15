using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodTech.Api.Models;
using FoodTech.Infrastructure.Data;

namespace FoodTech.Api.Controllers;

[ApiController]
[Route("health")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _context;

    public HealthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var dbConnected = false;
        try
        {
            // Try to ping the database
            await _context.Database.ExecuteSqlRawAsync("SELECT 1");
            dbConnected = true;
        }
        catch
        {
            dbConnected = false;
        }

        var response = new HealthResponse(
            dbConnected ? "healthy" : "degraded",
            "1.0.0",
            DateTime.UtcNow,
            dbConnected
        );

        return Ok(response);
    }
}
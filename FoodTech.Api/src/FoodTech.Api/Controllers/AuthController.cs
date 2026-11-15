using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FoodTech.Api.Models;
using FoodTech.Api.Validators;
using FoodTech.Domain.Services;
using FoodTech.Domain.Enums;
using FoodTech.Domain.Entities;

namespace FoodTech.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly RegisterRequestValidator _registerValidator;
    private readonly LoginRequestValidator _loginValidator;
    private readonly RefreshTokenRequestValidator _refreshValidator;
    private readonly ChangePasswordRequestValidator _changePasswordValidator;

    public AuthController(
        IAuthService authService,
        RegisterRequestValidator registerValidator,
        LoginRequestValidator loginValidator,
        RefreshTokenRequestValidator refreshValidator,
        ChangePasswordRequestValidator changePasswordValidator)
    {
        _authService = authService;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
        _refreshValidator = refreshValidator;
        _changePasswordValidator = changePasswordValidator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var validationResult = await _registerValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        try
        {
            var (accessToken, refreshToken, user) = await _authService.RegisterAsync(
                request.Email, request.Password, request.Name, request.Role, request.Phone);

            var userDto = MapToUserDto(user);
            var response = new AuthResponse(accessToken, refreshToken, userDto);
            return Ok(ApiResponse<AuthResponse>.Ok(response, Request.Path));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.Error("CONFLICT", ex.Message, Request.Path));
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var validationResult = await _loginValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        try
        {
            var (accessToken, refreshToken, user) = await _authService.LoginAsync(request.Email, request.Password);

            var userDto = MapToUserDto(user);
            var response = new AuthResponse(accessToken, refreshToken, userDto);
            return Ok(ApiResponse<AuthResponse>.Ok(response, Request.Path));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<object>.Error("UNAUTHORIZED", ex.Message, Request.Path));
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var validationResult = await _refreshValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        try
        {
            var (accessToken, refreshToken) = await _authService.RefreshTokenAsync(request.RefreshToken);
            var response = new { accessToken, refreshToken };
            return Ok(ApiResponse<object>.Ok(response, Request.Path));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<object>.Error("UNAUTHORIZED", ex.Message, Request.Path));
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse<object>.Error("UNAUTHORIZED", "Invalid token", Request.Path));
        }

        var user = await _authService.GetCurrentUserAsync(userId);
        if (user == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "User not found", Request.Path));
        }

        var userDto = MapToUserDto(user);
        VendorProfileDto? vendorProfileDto = null;

        if (!string.IsNullOrEmpty(user.VendorProfileId))
        {
            // TODO: Get vendor profile from repository
            // This would require injecting IVendorProfileRepository
        }

        var response = new MeResponse(userDto, vendorProfileDto);
        return Ok(ApiResponse<MeResponse>.Ok(response, Request.Path));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse<object>.Error("UNAUTHORIZED", "Invalid token", Request.Path));
        }

        await _authService.RevokeRefreshTokenAsync(userId);
        return Ok(ApiResponse<object>.Ok(new { message = "Logged out successfully" }, Request.Path));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var validationResult = await _changePasswordValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse<object>.Error("UNAUTHORIZED", "Invalid token", Request.Path));
        }

        var success = await _authService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
        if (!success)
        {
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Current password is incorrect", Request.Path));
        }

        return Ok(ApiResponse<object>.Ok(new { message = "Password changed successfully" }, Request.Path));
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto(
            user.Id,
            user.Email,
            user.Name,
            user.Role,
            user.Phone,
            user.AvatarUrl,
            user.IsActive,
            user.VendorProfileId,
            user.LastLoginAt,
            user.CreatedAt
        );
    }
}
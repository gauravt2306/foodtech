using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FoodTech.Api.Models;
using FoodTech.Api.Validators;
using FoodTech.Domain.Repositories;
using FoodTech.Domain.Services;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using Mapster;

namespace FoodTech.Api.Controllers;

[ApiController]
[Route("api/v1/superadmin")]
[Authorize(Roles = "superadmin")]
public class SuperAdminController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IVendorProfileRepository _vendorProfileRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IAnalyticsService _analyticsService;
    private readonly ApproveVendorRequestValidator _approveVendorValidator;
    private readonly UpdateUserStatusRequestValidator _updateUserStatusValidator;

    public SuperAdminController(
        IUserRepository userRepository,
        IVendorProfileRepository vendorProfileRepository,
        IOrderRepository orderRepository,
        IAnalyticsService analyticsService,
        ApproveVendorRequestValidator approveVendorValidator,
        UpdateUserStatusRequestValidator updateUserStatusValidator)
    {
        _userRepository = userRepository;
        _vendorProfileRepository = vendorProfileRepository;
        _orderRepository = orderRepository;
        _analyticsService = analyticsService;
        _approveVendorValidator = approveVendorValidator;
        _updateUserStatusValidator = updateUserStatusValidator;
    }

    [HttpGet("vendors")]
    public async Task<IActionResult> GetVendors()
    {
        var vendors = await _vendorProfileRepository.GetAllAsync();
        var dtos = new List<SuperAdminVendorDto>();

        foreach (var vendor in vendors)
        {
            var user = await _userRepository.GetByIdAsync(vendor.UserId);
            dtos.Add(new SuperAdminVendorDto(
                vendor.Id,
                vendor.UserId,
                user?.Email ?? "",
                user?.Name ?? "",
                vendor.BusinessName,
                vendor.GstNumber,
                vendor.IsApproved,
                vendor.ApprovedBy,
                vendor.ApprovedAt,
                vendor.Rating,
                vendor.TotalOrders,
                vendor.CreatedAt
            ));
        }

        return Ok(ApiResponse<List<SuperAdminVendorDto>>.Ok(dtos, Request.Path));
    }

    [HttpGet("vendors/{id}")]
    public async Task<IActionResult> GetVendor(string id)
    {
        var vendor = await _vendorProfileRepository.GetByIdAsync(id);
        if (vendor == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor not found", Request.Path));
        }

        var user = await _userRepository.GetByIdAsync(vendor.UserId);
        var dto = new SuperAdminVendorDto(
            vendor.Id,
            vendor.UserId,
            user?.Email ?? "",
            user?.Name ?? "",
            vendor.BusinessName,
            vendor.GstNumber,
            vendor.IsApproved,
            vendor.ApprovedBy,
            vendor.ApprovedAt,
            vendor.Rating,
            vendor.TotalOrders,
            vendor.CreatedAt
        );

        return Ok(ApiResponse<SuperAdminVendorDto>.Ok(dto, Request.Path));
    }

    [HttpGet("vendors/pending")]
    public async Task<IActionResult> GetPendingVendors()
    {
        var vendors = await _vendorProfileRepository.GetPendingApprovalAsync();
        var dtos = new List<SuperAdminVendorDto>();

        foreach (var vendor in vendors)
        {
            var user = await _userRepository.GetByIdAsync(vendor.UserId);
            dtos.Add(new SuperAdminVendorDto(
                vendor.Id,
                vendor.UserId,
                user?.Email ?? "",
                user?.Name ?? "",
                vendor.BusinessName,
                vendor.GstNumber,
                vendor.IsApproved,
                vendor.ApprovedBy,
                vendor.ApprovedAt,
                vendor.Rating,
                vendor.TotalOrders,
                vendor.CreatedAt
            ));
        }

        return Ok(ApiResponse<List<SuperAdminVendorDto>>.Ok(dtos, Request.Path));
    }

    [HttpPatch("vendors/{id}/approve")]
    public async Task<IActionResult> ApproveVendor(string id, [FromBody] ApproveVendorRequest request)
    {
        var validationResult = await _approveVendorValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        var vendor = await _vendorProfileRepository.GetByIdAsync(id);
        if (vendor == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor not found", Request.Path));
        }

        var superAdminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        vendor.IsApproved = request.Approve;
        vendor.ApprovedBy = superAdminId;
        vendor.ApprovedAt = request.Approve ? DateTime.UtcNow : null;

        var updated = await _vendorProfileRepository.UpdateAsync(vendor);
        if (updated == null)
        {
            return BadRequest(ApiResponse<object>.Error("INTERNAL_ERROR", "Failed to update vendor approval", Request.Path));
        }

        var dto = updated.Adapt<SuperAdminVendorDto>();
        return Ok(ApiResponse<SuperAdminVendorDto>.Ok(dto, Request.Path));
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userRepository.GetAllAsync();
        var dtos = users.Select(u => new SuperAdminUserDto(
            u.Id,
            u.Email,
            u.Name,
            u.Role,
            u.Phone,
            u.AvatarUrl,
            u.IsActive,
            u.VendorProfileId,
            u.LastLoginAt,
            u.CreatedAt
        )).ToArray();

        return Ok(ApiResponse<SuperAdminUserDto[]>.Ok(dtos, Request.Path));
    }

    [HttpPatch("users/{id}/status")]
    public async Task<IActionResult> UpdateUserStatus(string id, [FromBody] UpdateUserStatusRequest request)
    {
        var validationResult = await _updateUserStatusValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "User not found", Request.Path));
        }

        user.IsActive = request.IsActive;
        var updated = await _userRepository.UpdateAsync(user);
        if (updated == null)
        {
            return BadRequest(ApiResponse<object>.Error("INTERNAL_ERROR", "Failed to update user status", Request.Path));
        }

        var dto = updated.Adapt<SuperAdminUserDto>();
        return Ok(ApiResponse<SuperAdminUserDto>.Ok(dto, Request.Path));
    }

    [HttpGet("analytics/dashboard")]
    public async Task<IActionResult> GetDashboardAnalytics()
    {
        var result = await _analyticsService.GetDashboardStatsAsync();
        return Ok(ApiResponse<object>.Ok(result, Request.Path));
    }

    [HttpGet("analytics/orders")]
    public async Task<IActionResult> GetOrderAnalytics([FromQuery] string? vendorId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _analyticsService.GetOrderAnalyticsAsync(vendorId, from, to);
        return Ok(ApiResponse<object>.Ok(result, Request.Path));
    }

    [HttpGet("analytics/revenue")]
    public async Task<IActionResult> GetRevenueAnalytics([FromQuery] string? vendorId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _analyticsService.GetRevenueAnalyticsAsync(vendorId, from, to);
        return Ok(ApiResponse<object>.Ok(result, Request.Path));
    }

    [HttpGet("analytics/vendors")]
    public async Task<IActionResult> GetVendorPerformance()
    {
        var result = await _analyticsService.GetVendorPerformanceAsync();
        return Ok(ApiResponse<object>.Ok(result, Request.Path));
    }
}
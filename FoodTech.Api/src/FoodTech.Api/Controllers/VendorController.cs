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
[Route("api/v1/vendor")]
[Authorize(Roles = "vendor")]
public class VendorController : ControllerBase
{
    private readonly IVendorProfileRepository _vendorProfileRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMenuItemRepository _menuItemRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IQRService _qrService;
    private readonly UpdateVendorProfileRequestValidator _updateProfileValidator;
    private readonly CreateVendorProfileRequestValidator _createProfileValidator;
    private readonly CreateMenuItemRequestValidator _createMenuItemValidator;
    private readonly UpdateMenuItemRequestValidator _updateMenuItemValidator;
    private readonly UpdateOrderStatusRequestValidator _updateStatusValidator;
    private readonly HandoffOrderRequestValidator _handoffValidator;

    public VendorController(
        IVendorProfileRepository vendorProfileRepository,
        IUserRepository userRepository,
        IMenuItemRepository menuItemRepository,
        IOrderRepository orderRepository,
        IQRService qrService,
        UpdateVendorProfileRequestValidator updateProfileValidator,
        CreateVendorProfileRequestValidator createProfileValidator,
        CreateMenuItemRequestValidator createMenuItemValidator,
        UpdateMenuItemRequestValidator updateMenuItemValidator,
        UpdateOrderStatusRequestValidator updateStatusValidator,
        HandoffOrderRequestValidator handoffValidator)
    {
        _vendorProfileRepository = vendorProfileRepository;
        _userRepository = userRepository;
        _menuItemRepository = menuItemRepository;
        _orderRepository = orderRepository;
        _qrService = qrService;
        _updateProfileValidator = updateProfileValidator;
        _createProfileValidator = createProfileValidator;
        _createMenuItemValidator = createMenuItemValidator;
        _updateMenuItemValidator = updateMenuItemValidator;
        _updateStatusValidator = updateStatusValidator;
        _handoffValidator = handoffValidator;
    }

    private string GetVendorId()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return userId ?? throw new UnauthorizedAccessException("Invalid token");
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetVendorId();
        var vendorProfile = await _vendorProfileRepository.GetByUserIdAsync(userId);

        if (vendorProfile == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor profile not found", Request.Path));
        }

        var dto = vendorProfile.Adapt<VendorProfileDto>();
        return Ok(ApiResponse<VendorProfileDto>.Ok(dto, Request.Path));
    }

    [HttpPost("profile")]
    public async Task<IActionResult> CreateProfile([FromBody] CreateVendorProfileRequest request)
    {
        var validationResult = await _createProfileValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        var userId = GetVendorId();
        var existingProfile = await _vendorProfileRepository.GetByUserIdAsync(userId);

        if (existingProfile != null)
        {
            return BadRequest(ApiResponse<object>.Error("CONFLICT", "Vendor profile already exists", Request.Path));
        }

        var exists = await _vendorProfileRepository.ExistsByGstNumberAsync(request.GstNumber);
        if (exists)
        {
            return BadRequest(ApiResponse<object>.Error("CONFLICT", "GST number already exists", Request.Path));
        }

        var vendorProfile = new VendorProfile
        {
            UserId = userId,
            BusinessName = request.BusinessName,
            GstNumber = request.GstNumber,
            Address = request.Address.Adapt<Address>(),
            OperatingHours = request.OperatingHours.Adapt<OperatingHours>(),
            IsApproved = false,
            Rating = 0,
            TotalOrders = 0
        };

        var created = await _vendorProfileRepository.CreateAsync(vendorProfile);

        // Update user with vendor profile ID
        var user = await _userRepository.GetByIdAsync(userId);
        if (user != null)
        {
            user.VendorProfileId = created.Id;
            await _userRepository.UpdateAsync(user);
        }

        var dto = created.Adapt<VendorProfileDto>();
        return Created($"/api/v1/vendor/profile", ApiResponse<VendorProfileDto>.Ok(dto, Request.Path));
    }

    [HttpPatch("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateVendorProfileRequest request)
    {
        var validationResult = await _updateProfileValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        var userId = GetVendorId();
        var vendorProfile = await _vendorProfileRepository.GetByUserIdAsync(userId);

        if (vendorProfile == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor profile not found", Request.Path));
        }

        if (vendorProfile.GstNumber != request.GstNumber)
        {
            var exists = await _vendorProfileRepository.ExistsByGstNumberAsync(request.GstNumber);
            if (exists)
            {
                return BadRequest(ApiResponse<object>.Error("CONFLICT", "GST number already exists", Request.Path));
            }
        }

        vendorProfile.BusinessName = request.BusinessName;
        vendorProfile.GstNumber = request.GstNumber;
        vendorProfile.Address = request.Address.Adapt<Address>();
        vendorProfile.OperatingHours = request.OperatingHours.Adapt<OperatingHours>();

        var updated = await _vendorProfileRepository.UpdateAsync(vendorProfile);
        if (updated == null)
        {
            return BadRequest(ApiResponse<object>.Error("INTERNAL_ERROR", "Failed to update profile", Request.Path));
        }

        var dto = updated.Adapt<VendorProfileDto>();
        return Ok(ApiResponse<VendorProfileDto>.Ok(dto, Request.Path));
    }

    [HttpGet("menu")]
    public async Task<IActionResult> GetMenu([FromQuery] Category? category)
    {
        var userId = GetVendorId();
        var vendorProfile = await _vendorProfileRepository.GetByUserIdAsync(userId);

        if (vendorProfile == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor profile not found", Request.Path));
        }

        IEnumerable<MenuItem> menuItems;
        if (category.HasValue)
        {
            menuItems = await _menuItemRepository.GetByVendorIdAndCategoryAsync(vendorProfile.Id, category.Value);
        }
        else
        {
            menuItems = await _menuItemRepository.GetByVendorIdAsync(vendorProfile.Id);
        }

        var dtos = menuItems.Select(m => m.Adapt<MenuItemDto>()).ToArray();
        return Ok(ApiResponse<MenuItemDto[]>.Ok(dtos, Request.Path));
    }

    [HttpPost("menu")]
    public async Task<IActionResult> CreateMenuItem([FromBody] CreateMenuItemRequest request)
    {
        var validationResult = await _createMenuItemValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        var userId = GetVendorId();
        var vendorProfile = await _vendorProfileRepository.GetByUserIdAsync(userId);

        if (vendorProfile == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor profile not found", Request.Path));
        }

        var menuItem = new MenuItem
        {
            VendorId = vendorProfile.Id,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Category = request.Category,
            DietType = request.DietType,
            ImageUrl = request.ImageUrl,
            PrepTimeMinutes = request.PrepTimeMinutes,
            Tags = request.Tags,
            IsAvailable = true
        };

        var created = await _menuItemRepository.CreateAsync(menuItem);
        var dto = created.Adapt<MenuItemDto>();
        return Created($"/api/v1/vendor/menu/{created.Id}", ApiResponse<MenuItemDto>.Ok(dto, Request.Path));
    }

    [HttpPatch("menu/{id}")]
    public async Task<IActionResult> UpdateMenuItem(string id, [FromBody] UpdateMenuItemRequest request)
    {
        var validationResult = await _updateMenuItemValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        var userId = GetVendorId();
        var vendorProfile = await _vendorProfileRepository.GetByUserIdAsync(userId);

        if (vendorProfile == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor profile not found", Request.Path));
        }

        var menuItem = await _menuItemRepository.GetByIdAsync(id);
        if (menuItem == null || menuItem.VendorId != vendorProfile.Id)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Menu item not found", Request.Path));
        }

        if (request.Name != null) menuItem.Name = request.Name;
        if (request.Description != null) menuItem.Description = request.Description;
        if (request.Price.HasValue) menuItem.Price = request.Price.Value;
        if (request.Category.HasValue) menuItem.Category = request.Category.Value;
        if (request.DietType.HasValue) menuItem.DietType = request.DietType.Value;
        if (request.ImageUrl != null) menuItem.ImageUrl = request.ImageUrl;
        if (request.IsAvailable.HasValue) menuItem.IsAvailable = request.IsAvailable.Value;
        if (request.PrepTimeMinutes.HasValue) menuItem.PrepTimeMinutes = request.PrepTimeMinutes.Value;
        if (request.Tags != null) menuItem.Tags = request.Tags;

        var updated = await _menuItemRepository.UpdateAsync(menuItem);
        if (updated == null)
        {
            return BadRequest(ApiResponse<object>.Error("INTERNAL_ERROR", "Failed to update menu item", Request.Path));
        }

        var dto = updated.Adapt<MenuItemDto>();
        return Ok(ApiResponse<MenuItemDto>.Ok(dto, Request.Path));
    }

    [HttpDelete("menu/{id}")]
    public async Task<IActionResult> DeleteMenuItem(string id)
    {
        var userId = GetVendorId();
        var vendorProfile = await _vendorProfileRepository.GetByUserIdAsync(userId);

        if (vendorProfile == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor profile not found", Request.Path));
        }

        var menuItem = await _menuItemRepository.GetByIdAsync(id);
        if (menuItem == null || menuItem.VendorId != vendorProfile.Id)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Menu item not found", Request.Path));
        }

        var deleted = await _menuItemRepository.DeleteAsync(id);
        if (!deleted)
        {
            return BadRequest(ApiResponse<object>.Error("INTERNAL_ERROR", "Failed to delete menu item", Request.Path));
        }

        return Ok(ApiResponse<object>.Ok(new { message = "Menu item deleted" }, Request.Path));
    }

    [HttpGet("menu/{id}")]
    public async Task<IActionResult> GetMenuItem(string id)
    {
        var userId = GetVendorId();
        var vendorProfile = await _vendorProfileRepository.GetByUserIdAsync(userId);

        if (vendorProfile == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor profile not found", Request.Path));
        }

        var menuItem = await _menuItemRepository.GetByIdAsync(id);
        if (menuItem == null || menuItem.VendorId != vendorProfile.Id)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Menu item not found", Request.Path));
        }

        var dto = menuItem.Adapt<MenuItemDto>();
        return Ok(ApiResponse<MenuItemDto>.Ok(dto, Request.Path));
    }

    [HttpGet("orders/{id}")]
    public async Task<IActionResult> GetOrder(string id)
    {
        var userId = GetVendorId();
        var vendorProfile = await _vendorProfileRepository.GetByUserIdAsync(userId);

        if (vendorProfile == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor profile not found", Request.Path));
        }

        var order = await _orderRepository.GetByIdAsync(id);
        if (order == null || order.VendorId != vendorProfile.Id)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Order not found", Request.Path));
        }

        var dto = order.Adapt<OrderDto>();
        return Ok(ApiResponse<OrderDto>.Ok(dto, Request.Path));
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders()
    {
        var userId = GetVendorId();
        var vendorProfile = await _vendorProfileRepository.GetByUserIdAsync(userId);

        if (vendorProfile == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor profile not found", Request.Path));
        }

        var orders = await _orderRepository.GetByVendorIdAsync(vendorProfile.Id);
        var orderDtos = orders.Select(o => o.Adapt<OrderDto>()).ToArray();

        var response = new VendorOrdersResponse(
            orderDtos.Where(o => o.Status == OrderStatus.Pending).ToArray(),
            orderDtos.Where(o => o.Status == OrderStatus.Confirmed).ToArray(),
            orderDtos.Where(o => o.Status == OrderStatus.Preparing).ToArray(),
            orderDtos.Where(o => o.Status == OrderStatus.Ready).ToArray(),
            orderDtos.Where(o => o.Status == OrderStatus.Completed).ToArray(),
            orderDtos.Where(o => o.Status == OrderStatus.Cancelled).ToArray()
        );

        return Ok(ApiResponse<VendorOrdersResponse>.Ok(response, Request.Path));
    }

    [HttpPatch("orders/{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(string id, [FromBody] UpdateOrderStatusRequest request)
    {
        var validationResult = await _updateStatusValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        var userId = GetVendorId();
        var vendorProfile = await _vendorProfileRepository.GetByUserIdAsync(userId);

        if (vendorProfile == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor profile not found", Request.Path));
        }

        var order = await _orderRepository.GetByIdAsync(id);
        if (order == null || order.VendorId != vendorProfile.Id)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Order not found", Request.Path));
        }

        if (!IsValidTransition(order.Status, request.Status))
        {
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", $"Invalid status transition from {order.Status} to {request.Status}", Request.Path));
        }

        order.Status = request.Status;
        var updated = await _orderRepository.UpdateAsync(order);
        if (updated == null)
        {
            return BadRequest(ApiResponse<object>.Error("INTERNAL_ERROR", "Failed to update order status", Request.Path));
        }

        var dto = updated.Adapt<OrderDto>();
        return Ok(ApiResponse<OrderDto>.Ok(dto, Request.Path));
    }

    [HttpPost("orders/{id}/handoff")]
    public async Task<IActionResult> HandoffOrder(string id, [FromBody] HandoffOrderRequest request)
    {
        var validationResult = await _handoffValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        var userId = GetVendorId();
        var vendorProfile = await _vendorProfileRepository.GetByUserIdAsync(userId);

        if (vendorProfile == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor profile not found", Request.Path));
        }

        var order = await _orderRepository.GetByIdAsync(id);
        if (order == null || order.VendorId != vendorProfile.Id)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Order not found", Request.Path));
        }

        if (!_qrService.VerifyQrToken(request.QrToken, out var orderId, out var verifiedVendorId))
        {
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Invalid or expired QR token", Request.Path));
        }

        if (orderId != id || verifiedVendorId != vendorProfile.Id)
        {
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "QR token does not match this order", Request.Path));
        }

        if (order.Status != OrderStatus.Ready)
        {
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Order must be in Ready status for handoff", Request.Path));
        }

        order.Status = OrderStatus.Completed;
        order.HandoffAt = DateTime.UtcNow;
        order.HandoffBy = userId;

        var updated = await _orderRepository.UpdateAsync(order);
        if (updated == null)
        {
            return BadRequest(ApiResponse<object>.Error("INTERNAL_ERROR", "Failed to complete handoff", Request.Path));
        }

        var dto = updated.Adapt<OrderDto>();
        return Ok(ApiResponse<OrderDto>.Ok(dto, Request.Path));
    }

    private static bool IsValidTransition(OrderStatus from, OrderStatus to)
    {
        return (from, to) switch
        {
            (OrderStatus.Pending, OrderStatus.Confirmed) => true,
            (OrderStatus.Pending, OrderStatus.Cancelled) => true,
            (OrderStatus.Confirmed, OrderStatus.Preparing) => true,
            (OrderStatus.Confirmed, OrderStatus.Cancelled) => true,
            (OrderStatus.Preparing, OrderStatus.Ready) => true,
            (OrderStatus.Preparing, OrderStatus.Cancelled) => true,
            (OrderStatus.Ready, OrderStatus.Completed) => true,
            (OrderStatus.Ready, OrderStatus.Cancelled) => true,
            _ => false
        };
    }
}
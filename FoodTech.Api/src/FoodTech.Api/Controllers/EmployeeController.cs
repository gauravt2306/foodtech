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
[Route("api/v1/employee")]
[Authorize(Roles = "employee")]
public class EmployeeController : ControllerBase
{
    private readonly IVendorProfileRepository _vendorProfileRepository;
    private readonly IMenuItemRepository _menuItemRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IQRService _qrService;
    private readonly CreateOrderRequestValidator _createOrderValidator;
    private readonly PayOrderRequestValidator _payOrderValidator;

    public EmployeeController(
        IVendorProfileRepository vendorProfileRepository,
        IMenuItemRepository menuItemRepository,
        IOrderRepository orderRepository,
        IQRService qrService,
        CreateOrderRequestValidator createOrderValidator,
        PayOrderRequestValidator payOrderValidator)
    {
        _vendorProfileRepository = vendorProfileRepository;
        _menuItemRepository = menuItemRepository;
        _orderRepository = orderRepository;
        _qrService = qrService;
        _createOrderValidator = createOrderValidator;
        _payOrderValidator = payOrderValidator;
    }

    private string GetEmployeeId()
    {
        return User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Invalid token");
    }

    [HttpGet("vendors")]
    public async Task<IActionResult> GetVendors()
    {
        var vendors = await _vendorProfileRepository.GetApprovedAsync();
        var dtos = new List<VendorListItemDto>();

        foreach (var vendor in vendors)
        {
            var menuCount = await _menuItemRepository.CountByVendorIdAsync(vendor.Id);
            var user = new User { Id = vendor.UserId, Email = "", Name = "" }; // We'd need to fetch user for email/name

            dtos.Add(new VendorListItemDto(
                vendor.Id,
                vendor.BusinessName,
                vendor.GstNumber,
                vendor.Address.Adapt<AddressDto>(),
                vendor.OperatingHours.Adapt<OperatingHoursDto>(),
                vendor.IsApproved,
                vendor.Rating,
                vendor.TotalOrders,
                (int)menuCount
            ));
        }

        return Ok(ApiResponse<List<VendorListItemDto>>.Ok(dtos, Request.Path));
    }

    [HttpGet("vendors/{id}/menu")]
    public async Task<IActionResult> GetVendorMenu(string id)
    {
        var vendor = await _vendorProfileRepository.GetByIdAsync(id);
        if (vendor == null || !vendor.IsApproved)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor not found or not approved", Request.Path));
        }

        var menuItems = await _menuItemRepository.GetAvailableByVendorIdAsync(id);
        var dtos = menuItems.Select(m => m.Adapt<MenuItemDto>()).ToArray();

        var response = new EmployeeVendorMenuDto(vendor.Id, vendor.BusinessName, dtos);
        return Ok(ApiResponse<EmployeeVendorMenuDto>.Ok(response, Request.Path));
    }

    [HttpPost("orders")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var validationResult = await _createOrderValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        var vendor = await _vendorProfileRepository.GetByIdAsync(request.VendorId);
        if (vendor == null || !vendor.IsApproved)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor not found or not approved", Request.Path));
        }

        var employeeId = GetEmployeeId();
        var orderItems = new List<OrderItem>();
        long subtotal = 0;

        foreach (var itemRequest in request.Items)
        {
            var menuItem = await _menuItemRepository.GetByIdAsync(itemRequest.MenuItemId);
            if (menuItem == null || menuItem.VendorId != request.VendorId || !menuItem.IsAvailable)
            {
                return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", $"Menu item {itemRequest.MenuItemId} not found or unavailable", Request.Path));
            }

            var orderItem = new OrderItem
            {
                MenuItemId = menuItem.Id,
                Name = menuItem.Name,
                Price = menuItem.Price,
                Quantity = itemRequest.Quantity,
                DietType = menuItem.DietType
            };

            orderItems.Add(orderItem);
            subtotal += menuItem.Price * itemRequest.Quantity;
        }

        var tax = (long)Math.Round(subtotal * 0.05m); // 5% GST
        var total = subtotal + tax;

        var order = new Order
        {
            EmployeeId = employeeId,
            VendorId = request.VendorId,
            Items = orderItems.ToArray(),
            Status = OrderStatus.Pending,
            Subtotal = subtotal,
            Tax = tax,
            Total = total,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = PaymentStatus.Pending,
            SpecialInstructions = request.SpecialInstructions,
            PickupTime = request.PickupTime,
            QrCodeData = _qrService.GenerateQrToken(new Order
            {
                Id = "",
                VendorId = request.VendorId,
                OrderNumber = ""
            }) // Will be updated after order creation
        };

        var created = await _orderRepository.CreateAsync(order);

        // Regenerate QR code with actual order ID and number
        created.QrCodeData = _qrService.GenerateQrToken(created);
        await _orderRepository.UpdateAsync(created);

        var response = new CreateOrderResponse(
            created.Id,
            created.OrderNumber,
            created.Subtotal,
            created.Tax,
            created.Total,
            created.QrCodeData
        );

        return Created($"/api/v1/employee/orders/{created.Id}", ApiResponse<CreateOrderResponse>.Ok(response, Request.Path));
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders()
    {
        var employeeId = GetEmployeeId();
        var orders = await _orderRepository.GetByEmployeeIdAsync(employeeId);
        var dtos = orders.Select(o => o.Adapt<EmployeeOrderDto>()).ToArray();
        return Ok(ApiResponse<EmployeeOrderDto[]>.Ok(dtos, Request.Path));
    }

    [HttpPost("orders/{id}/pay")]
    public async Task<IActionResult> PayOrder(string id, [FromBody] PayOrderRequest request)
    {
        var validationResult = await _payOrderValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        var employeeId = GetEmployeeId();
        var order = await _orderRepository.GetByIdAsync(id);

        if (order == null || order.EmployeeId != employeeId)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Order not found", Request.Path));
        }

        if (order.PaymentStatus == PaymentStatus.Paid)
        {
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Order already paid", Request.Path));
        }

        order.PaymentStatus = PaymentStatus.Paid;
        order.PaymentId = request.PaymentId;
        order.Status = OrderStatus.Confirmed;

        var updated = await _orderRepository.UpdateAsync(order);
        if (updated == null)
        {
            return BadRequest(ApiResponse<object>.Error("INTERNAL_ERROR", "Failed to process payment", Request.Path));
        }

        var dto = updated.Adapt<EmployeeOrderDto>();
        return Ok(ApiResponse<EmployeeOrderDto>.Ok(dto, Request.Path));
    }

    [HttpGet("orders/{id}/qr")]
    public async Task<IActionResult> GetQrCode(string id)
    {
        var employeeId = GetEmployeeId();
        var order = await _orderRepository.GetByIdAsync(id);

        if (order == null || order.EmployeeId != employeeId)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Order not found", Request.Path));
        }

        // Generate fresh QR token
        var qrToken = _qrService.GenerateQrToken(order);
        order.QrCodeData = qrToken;
        await _orderRepository.UpdateAsync(order);

        var response = new QrCodeResponse(qrToken);
        return Ok(ApiResponse<QrCodeResponse>.Ok(response, Request.Path));
    }
}
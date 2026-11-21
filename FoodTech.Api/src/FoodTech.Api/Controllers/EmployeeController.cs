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
    private readonly UpiPaymentInitiateRequestValidator _upiInitiateValidator;
    private readonly UpiPaymentCallbackRequestValidator _upiCallbackValidator;

    public EmployeeController(
        IVendorProfileRepository vendorProfileRepository,
        IMenuItemRepository menuItemRepository,
        IOrderRepository orderRepository,
        IQRService qrService,
        CreateOrderRequestValidator createOrderValidator,
        PayOrderRequestValidator payOrderValidator,
        UpiPaymentInitiateRequestValidator upiInitiateValidator,
        UpiPaymentCallbackRequestValidator upiCallbackValidator)
    {
        _vendorProfileRepository = vendorProfileRepository;
        _menuItemRepository = menuItemRepository;
        _orderRepository = orderRepository;
        _qrService = qrService;
        _createOrderValidator = createOrderValidator;
        _payOrderValidator = payOrderValidator;
        _upiInitiateValidator = upiInitiateValidator;
        _upiCallbackValidator = upiCallbackValidator;
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

        var taxAmount = (long)Math.Round(subtotal * 0.05m); // 5% GST
        var total = subtotal + taxAmount;

        var order = new Order
        {
            EmployeeId = employeeId,
            VendorId = request.VendorId,
            Items = orderItems.ToArray(),
            Status = OrderStatus.Pending,
            Subtotal = subtotal,
            TaxAmount = taxAmount,
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
            created.TaxAmount,
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

        // Fetch vendor names for all orders
        var vendorIds = orders.Select(o => o.VendorId).Distinct().ToArray();
        var vendors = new Dictionary<string, string>();
        foreach (var vendorId in vendorIds)
        {
            var vendor = await _vendorProfileRepository.GetByIdAsync(vendorId);
            if (vendor != null)
            {
                vendors[vendorId] = vendor.BusinessName;
            }
        }

        var dtos = orders.Select(o =>
        {
            var dto = o.Adapt<EmployeeOrderDto>();
            if (vendors.TryGetValue(o.VendorId, out var vendorName))
            {
                dto = dto with { VendorName = vendorName };
            }
            return dto;
        }).ToArray();

        return Ok(ApiResponse<EmployeeOrderDto[]>.Ok(dtos, Request.Path));
    }

    [HttpGet("vendors/{id}")]
    public async Task<IActionResult> GetVendor(string id)
    {
        var vendor = await _vendorProfileRepository.GetByIdAsync(id);
        if (vendor == null || !vendor.IsApproved)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Vendor not found or not approved", Request.Path));
        }

        var menuCount = await _menuItemRepository.CountByVendorIdAsync(vendor.Id);
        var dto = new VendorListItemDto(
            vendor.Id,
            vendor.BusinessName,
            vendor.GstNumber,
            vendor.Address.Adapt<AddressDto>(),
            vendor.OperatingHours.Adapt<OperatingHoursDto>(),
            vendor.IsApproved,
            vendor.Rating,
            vendor.TotalOrders,
            (int)menuCount
        );

        return Ok(ApiResponse<VendorListItemDto>.Ok(dto, Request.Path));
    }

    [HttpGet("orders/{id}")]
    public async Task<IActionResult> GetOrder(string id)
    {
        var employeeId = GetEmployeeId();
        var order = await _orderRepository.GetByIdAsync(id);

        if (order == null || order.EmployeeId != employeeId)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Order not found", Request.Path));
        }

        var dto = order.Adapt<EmployeeOrderDto>();

        // Fetch vendor name
        var vendor = await _vendorProfileRepository.GetByIdAsync(order.VendorId);
        if (vendor != null)
        {
            dto = dto with { VendorName = vendor.BusinessName };
        }

        return Ok(ApiResponse<EmployeeOrderDto>.Ok(dto, Request.Path));
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

        // Fetch vendor name
        var vendor = await _vendorProfileRepository.GetByIdAsync(updated.VendorId);
        if (vendor != null)
        {
            dto = dto with { VendorName = vendor.BusinessName };
        }

        return Ok(ApiResponse<EmployeeOrderDto>.Ok(dto, Request.Path));
    }

    [HttpPost("orders/{id}/upi/initiate")]
    public async Task<IActionResult> InitiateUpiPayment(string id, [FromBody] UpiPaymentInitiateRequest request)
    {
        var validationResult = await _upiInitiateValidator.ValidateAsync(request);
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

        if (order.PaymentMethod != PaymentMethod.Upi)
        {
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Order payment method is not UPI", Request.Path));
        }

        var transactionRef = $"UPI_{order.OrderNumber}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

        // Generate UPI deep link: upi://pay?pa=<vpa>&pn=FoodTech&am=<amount>&cu=INR&tn=<note>&tr=<ref>
        var amountInRupees = order.Total / 100m; // Convert paise to rupees
        var upiDeepLink = $"upi://pay?pa={Uri.EscapeDataString(request.UpiVpa)}" +
            $"&pn=FoodTech%20Order%20{order.OrderNumber}" +
            $"&am={amountInRupees:F2}" +
            $"&cu=INR" +
            $"&tn=Order%20{order.OrderNumber}" +
            $"&tr={Uri.EscapeDataString(transactionRef)}";

        order.PaymentId = transactionRef;
        await _orderRepository.UpdateAsync(order);

        var response = new UpiPaymentInitiateResponse(
            upiDeepLink,
            order.Id,
            order.Total,
            transactionRef
        );

        return Ok(ApiResponse<UpiPaymentInitiateResponse>.Ok(response, Request.Path));
    }

    [HttpPost("~/api/v1/upi/callback")]
    [AllowAnonymous] // UPI gateway calls this endpoint
    public async Task<IActionResult> UpiCallback([FromBody] UpiPaymentCallbackRequest request)
    {
        var validationResult = await _upiCallbackValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(ApiResponse<object>.Error("VALIDATION_ERROR", "Validation failed", Request.Path, errors));
        }

        // Find order by transaction reference (PaymentId)
        var order = await _orderRepository.GetByPaymentIdAsync(request.TransactionRef);

        if (order == null)
        {
            return NotFound(ApiResponse<object>.Error("NOT_FOUND", "Order not found for transaction", Request.Path));
        }

        if (order.PaymentStatus == PaymentStatus.Paid)
        {
            return Ok(ApiResponse<object>.Ok(new { message = "Payment already processed" }, Request.Path));
        }

        // Mock UPI gateway response handling
        var isSuccess = request.Status.Equals("SUCCESS", StringComparison.OrdinalIgnoreCase);

        if (isSuccess)
        {
            order.PaymentStatus = PaymentStatus.Paid;
            order.PaymentId = request.UpiTransactionId ?? request.TransactionRef;
            order.Status = OrderStatus.Confirmed;
        }
        else
        {
            order.PaymentStatus = PaymentStatus.Failed;
            order.Status = OrderStatus.Cancelled;
        }

        await _orderRepository.UpdateAsync(order);

        var response = new
        {
            Success = isSuccess,
            OrderId = order.Id,
            OrderNumber = order.OrderNumber,
            PaymentStatus = order.PaymentStatus.ToString(),
            UpiTransactionId = request.UpiTransactionId
        };

        return Ok(ApiResponse<object>.Ok(response, Request.Path));
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
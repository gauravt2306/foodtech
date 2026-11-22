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

/// <summary>
/// Employee-facing endpoints for browsing vendors, menus, and managing orders.
/// </summary>
[ApiController]
[Route("api/v1/employee")]
[Authorize(Roles = "employee")]
[Produces("application/json")]
[ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
[ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
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

    /// <summary>
    /// Gets all approved vendors with their basic information and menu item counts.
    /// </summary>
    /// <returns>List of approved vendors.</returns>
    /// <response code="200">Returns the list of vendors.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    /// <response code="403">Forbidden - user is not an employee.</response>
    [HttpGet("vendors")]
    [ProducesResponseType(typeof(ApiResponse<List<VendorListItemDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
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

    /// <summary>
    /// Gets the menu for a specific approved vendor.
    /// </summary>
    /// <param name="id">The vendor ID.</param>
    /// <returns>The vendor's available menu items.</returns>
    /// <response code="200">Returns the vendor menu.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    /// <response code="403">Forbidden - user is not an employee.</response>
    /// <response code="404">Vendor not found or not approved.</response>
    [HttpGet("vendors/{id}/menu")]
    [ProducesResponseType(typeof(ApiResponse<EmployeeVendorMenuDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
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

    /// <summary>
    /// Creates a new order for the authenticated employee.
    /// </summary>
    /// <param name="request">The order creation request containing vendor ID, items, payment method, etc.</param>
    /// <returns>The created order with QR code for pickup.</returns>
    /// <response code="201">Order created successfully.</response>
    /// <response code="400">Validation error or invalid menu items.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    /// <response code="403">Forbidden - user is not an employee.</response>
    /// <response code="404">Vendor not found or not approved.</response>
    [HttpPost("orders")]
    [ProducesResponseType(typeof(ApiResponse<CreateOrderResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
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

    /// <summary>
    /// Gets all orders for the authenticated employee.
    /// </summary>
    /// <returns>List of employee's orders with vendor names.</returns>
    /// <response code="200">Returns the list of orders.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    /// <response code="403">Forbidden - user is not an employee.</response>
    [HttpGet("orders")]
    [ProducesResponseType(typeof(ApiResponse<EmployeeOrderDto[]>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
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

    /// <summary>
    /// Gets detailed information for a specific approved vendor.
    /// </summary>
    /// <param name="id">The vendor ID.</param>
    /// <returns>The vendor details including menu item count.</returns>
    /// <response code="200">Returns the vendor details.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    /// <response code="403">Forbidden - user is not an employee.</response>
    /// <response code="404">Vendor not found or not approved.</response>
    [HttpGet("vendors/{id}")]
    [ProducesResponseType(typeof(ApiResponse<VendorListItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
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

    /// <summary>
    /// Gets detailed information for a specific order belonging to the authenticated employee.
    /// </summary>
    /// <param name="id">The order ID.</param>
    /// <returns>The order details with vendor name.</returns>
    /// <response code="200">Returns the order details.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    /// <response code="403">Forbidden - user is not an employee.</response>
    /// <response code="404">Order not found or does not belong to the employee.</response>
    [HttpGet("orders/{id}")]
    [ProducesResponseType(typeof(ApiResponse<EmployeeOrderDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
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

    /// <summary>
    /// Marks an order as paid (for cash/card payments).
    /// </summary>
    /// <param name="id">The order ID.</param>
    /// <param name="request">The payment request containing payment ID.</param>
    /// <returns>The updated order.</returns>
    /// <response code="200">Order marked as paid successfully.</response>
    /// <response code="400">Order already paid or validation error.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    /// <response code="403">Forbidden - user is not an employee.</response>
    /// <response code="404">Order not found or does not belong to the employee.</response>
    [HttpPost("orders/{id}/pay")]
    [ProducesResponseType(typeof(ApiResponse<EmployeeOrderDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
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

    /// <summary>
    /// Initiates a UPI payment for an order, returning a UPI deep link.
    /// </summary>
    /// <param name="id">The order ID.</param>
    /// <param name="request">The UPI payment initiation request containing the UPI VPA.</param>
    /// <returns>UPI deep link for payment initiation.</returns>
    /// <response code="200">UPI deep link generated successfully.</response>
    /// <response code="400">Order already paid, not a UPI order, or validation error.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    /// <response code="403">Forbidden - user is not an employee.</response>
    /// <response code="404">Order not found or does not belong to the employee.</response>
    [HttpPost("orders/{id}/upi/initiate")]
    [ProducesResponseType(typeof(ApiResponse<UpiPaymentInitiateResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
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

    /// <summary>
    /// Handles UPI payment gateway callbacks (webhook).
    /// </summary>
    /// <param name="request">The UPI payment callback request from the gateway.</param>
    /// <returns>Payment processing result.</returns>
    /// <response code="200">Callback processed successfully.</response>
    /// <response code="400">Validation error.</response>
    /// <response code="404">Order not found for the transaction reference.</response>
    [HttpPost("~/api/v1/upi/callback")]
    [AllowAnonymous] // UPI gateway calls this endpoint
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
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
            // Only confirm order if it's still pending; vendor may have already started processing
            if (order.Status == OrderStatus.Pending)
            {
                order.Status = OrderStatus.Confirmed;
            }
        }
        else
        {
            order.PaymentStatus = PaymentStatus.Failed;
            order.Status = OrderStatus.Cancelled;
        }

        try
        {
            await _orderRepository.UpdateAsync(order);
        }
        catch (Exception ex)
        {
            var innerMsg = ex.InnerException?.Message ?? ex.Message;
            return BadRequest(ApiResponse<object>.Error("INTERNAL_ERROR", $"Update failed: {innerMsg}", Request.Path));
        }

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

    /// <summary>
    /// Gets a fresh QR code for an order for vendor pickup verification.
    /// </summary>
    /// <param name="id">The order ID.</param>
    /// <returns>QR code token for the order.</returns>
    /// <response code="200">QR code generated successfully.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    /// <response code="403">Forbidden - user is not an employee.</response>
    /// <response code="404">Order not found or does not belong to the employee.</response>
    [HttpGet("orders/{id}/qr")]
    [ProducesResponseType(typeof(ApiResponse<QrCodeResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
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
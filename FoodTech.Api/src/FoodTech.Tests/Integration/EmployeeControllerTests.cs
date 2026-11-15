using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using FoodTech.Api.Models;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Tests.Fixtures;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FoodTech.Tests.Integration;

public class EmployeeControllerTests : BaseIntegrationTest
{
    private User _employeeUser = null!;
    private User _vendorUser = null!;
    private VendorProfile _vendorProfile = null!;
    private MenuItem _menuItem = null!;
    private string _employeeToken = string.Empty;

    public EmployeeControllerTests(CustomWebApplicationFactory factory) : base(factory) { }

    private async Task SetupEmployeeAsync()
    {
        _employeeUser = await CreateTestUserAsync("employee@test.com", "Test@123", UserRole.Employee, "Test Employee");
        _vendorUser = await CreateTestUserAsync("vendor@test.com", "Test@123", UserRole.Vendor, "Test Vendor");
        _vendorProfile = await CreateTestVendorAsync(_vendorUser.Id, "Test Vendor", "GST123456789");
        _menuItem = await CreateTestMenuItemAsync(_vendorProfile.Id, "Paneer Butter Masala", 250);
        _employeeToken = GenerateJwtToken(_employeeUser);
        SetAuthHeader(_employeeToken);
    }

    [Fact]
    public async Task GetVendors_ShouldReturnApprovedVendors()
    {
        // Arrange
        await SetupEmployeeAsync();

        // Act
        var response = await Client.GetAsync("/api/v1/employee/vendors");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<List<VendorListItemDto>>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.Should().HaveCount(1);
        result.Data[0].BusinessName.Should().Be("Test Vendor");
        result.Data[0].MenuItemCount.Should().Be(1);
    }

    [Fact]
    public async Task GetVendorMenu_ValidVendor_ShouldReturnCategorizedMenu()
    {
        // Arrange
        await SetupEmployeeAsync();

        // Add more items in different categories (using valid Category enum values)
        await CreateTestMenuItemAsync(_vendorProfile.Id, "Naan", 50, Category.Snacks);
        await CreateTestMenuItemAsync(_vendorProfile.Id, "Gulab Jamun", 80, Category.Breakfast);

        // Act
        var response = await Client.GetAsync($"/api/v1/employee/vendors/{_vendorProfile.Id}/menu");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<EmployeeVendorMenuDto>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.VendorId.Should().Be(_vendorProfile.Id);
        result.Data.BusinessName.Should().Be("Test Vendor");
        result.Data.MenuItems.Should().HaveCount(3);
    }

    [Fact]
    public async Task CreateOrder_ValidOrder_ShouldCreateWithGst()
    {
        // Arrange
        await SetupEmployeeAsync();

        var request = new
        {
            VendorId = _vendorProfile.Id,
            Items = new[]
            {
                new { MenuItemId = _menuItem.Id, Quantity = 2 }
            },
            PaymentMethod = "Upi",
            SpecialInstructions = "Less spicy",
            PickupTime = DateTime.UtcNow.AddHours(1).ToString("o")
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/employee/orders", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var result = await DeserializeResponse<ApiResponse<CreateOrderResponse>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.Subtotal.Should().Be(50000); // 250 * 2 * 100 (paise)
        result.Data.TaxAmount.Should().Be(2500); // 5% GST
        result.Data.Total.Should().Be(52500);
        result.Data.QrCodeData.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task CreateOrder_UnavailableItem_ShouldReturnError()
    {
        // Arrange
        await SetupEmployeeAsync();

        var unavailableItem = await CreateTestMenuItemAsync(_vendorProfile.Id, "Unavailable", 100);
        unavailableItem.IsAvailable = false;
        Context.MenuItems.Update(unavailableItem);
        await Context.SaveChangesAsync();

        var request = new
        {
            VendorId = _vendorProfile.Id,
            Items = new[]
            {
                new { MenuItemId = unavailableItem.Id, Quantity = 1 }
            },
            PaymentMethod = "Upi"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/employee/orders", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeFalse();
        result.ErrorInfo!.Code.Should().Be("VALIDATION_ERROR");
    }

    [Fact]
    public async Task GetOrders_ShouldReturnUserOrders()
    {
        // Arrange
        await SetupEmployeeAsync();

        var order = new Order
        {
            EmployeeId = _employeeUser.Id,
            VendorId = _vendorProfile.Id,
            Items = new[] { new OrderItem { MenuItemId = _menuItem.Id, Name = _menuItem.Name, Price = _menuItem.Price, Quantity = 1, DietType = _menuItem.DietType } },
            Status = OrderStatus.Confirmed,
            Subtotal = 25000,
            TaxAmount = 1250,
            Total = 26250,
            PaymentMethod = PaymentMethod.Upi,
            PaymentStatus = PaymentStatus.Pending,
            OrderNumber = "ORD-TEST-001"
        };
        Context.Orders.Add(order);
        await Context.SaveChangesAsync();

        // Act
        var response = await Client.GetAsync("/api/v1/employee/orders");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<EmployeeOrderDto[]>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.Should().HaveCount(1);
        result.Data[0].OrderNumber.Should().Be("ORD-TEST-001");
    }

    [Fact]
    public async Task PayOrder_ValidPayment_ShouldUpdateStatus()
    {
        // Arrange
        await SetupEmployeeAsync();

        var order = new Order
        {
            EmployeeId = _employeeUser.Id,
            VendorId = _vendorProfile.Id,
            Items = new[] { new OrderItem { MenuItemId = _menuItem.Id, Name = _menuItem.Name, Price = _menuItem.Price, Quantity = 1, DietType = _menuItem.DietType } },
            Status = OrderStatus.Pending,
            Subtotal = 25000,
            TaxAmount = 1250,
            Total = 26250,
            PaymentMethod = PaymentMethod.Upi,
            PaymentStatus = PaymentStatus.Pending,
            OrderNumber = "ORD-TEST-002"
        };
        Context.Orders.Add(order);
        await Context.SaveChangesAsync();

        var request = new { PaymentId = "PAY_TEST_123" };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/v1/employee/orders/{order.Id}/pay", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<EmployeeOrderDto>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.PaymentStatus.Should().Be(PaymentStatus.Paid);
        result.Data.Status.Should().Be(OrderStatus.Confirmed);
        result.Data.PaymentId.Should().Be("PAY_TEST_123");
    }

    [Fact]
    public async Task PayOrder_AlreadyPaid_ShouldReturnError()
    {
        // Arrange
        await SetupEmployeeAsync();

        var order = new Order
        {
            EmployeeId = _employeeUser.Id,
            VendorId = _vendorProfile.Id,
            Items = new[] { new OrderItem { MenuItemId = _menuItem.Id, Name = _menuItem.Name, Price = _menuItem.Price, Quantity = 1, DietType = _menuItem.DietType } },
            Status = OrderStatus.Confirmed,
            Subtotal = 25000,
            TaxAmount = 1250,
            Total = 26250,
            PaymentMethod = PaymentMethod.Upi,
            PaymentStatus = PaymentStatus.Paid,
            PaymentId = "PAY_EXISTING",
            OrderNumber = "ORD-TEST-003"
        };
        Context.Orders.Add(order);
        await Context.SaveChangesAsync();

        var request = new { PaymentId = "PAY_TEST_456" };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/v1/employee/orders/{order.Id}/pay", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeFalse();
        result.ErrorInfo!.Code.Should().Be("VALIDATION_ERROR");
    }

    [Fact]
    public async Task GetQrCode_ShouldReturnFreshQrToken()
    {
        // Arrange
        await SetupEmployeeAsync();

        var order = new Order
        {
            EmployeeId = _employeeUser.Id,
            VendorId = _vendorProfile.Id,
            Items = new[] { new OrderItem { MenuItemId = _menuItem.Id, Name = _menuItem.Name, Price = _menuItem.Price, Quantity = 1, DietType = _menuItem.DietType } },
            Status = OrderStatus.Confirmed,
            Subtotal = 25000,
            TaxAmount = 1250,
            Total = 26250,
            PaymentMethod = PaymentMethod.Upi,
            PaymentStatus = PaymentStatus.Paid,
            OrderNumber = "ORD-TEST-004"
        };
        Context.Orders.Add(order);
        await Context.SaveChangesAsync();

        // Act
        var response = await Client.GetAsync($"/api/v1/employee/orders/{order.Id}/qr");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<QrCodeResponse>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.QrToken.Should().NotBeNullOrEmpty();
        result.Data.QrToken.Should().Contain("."); // token.hash format
    }

    [Fact]
    public async Task InitiateUpiPayment_ValidOrder_ShouldReturnDeepLink()
    {
        // Arrange
        await SetupEmployeeAsync();

        var order = new Order
        {
            EmployeeId = _employeeUser.Id,
            VendorId = _vendorProfile.Id,
            Items = new[] { new OrderItem { MenuItemId = _menuItem.Id, Name = _menuItem.Name, Price = _menuItem.Price, Quantity = 1, DietType = _menuItem.DietType } },
            Status = OrderStatus.Pending,
            Subtotal = 25000,
            TaxAmount = 1250,
            Total = 26250,
            PaymentMethod = PaymentMethod.Upi,
            PaymentStatus = PaymentStatus.Pending,
            OrderNumber = "ORD-TEST-005"
        };
        Context.Orders.Add(order);
        await Context.SaveChangesAsync();

        var request = new { UpiVpa = "user@upi" };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/v1/employee/orders/{order.Id}/upi/initiate", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<UpiPaymentInitiateResponse>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.UpiDeepLink.Should().StartWith("upi://pay?");
        result.Data.UpiDeepLink.Should().Contain("pa=user%40upi");
        result.Data.UpiDeepLink.Should().Contain("am=262.50");
        result.Data.TransactionRef.Should().StartWith("UPI_ORD-TEST-005_");
    }

    [Fact]
    public async Task InitiateUpiPayment_NonUpiOrder_ShouldReturnError()
    {
        // Arrange
        await SetupEmployeeAsync();

        var order = new Order
        {
            EmployeeId = _employeeUser.Id,
            VendorId = _vendorProfile.Id,
            Items = new[] { new OrderItem { MenuItemId = _menuItem.Id, Name = _menuItem.Name, Price = _menuItem.Price, Quantity = 1, DietType = _menuItem.DietType } },
            Status = OrderStatus.Pending,
            Subtotal = 25000,
            TaxAmount = 1250,
            Total = 26250,
            PaymentMethod = PaymentMethod.Cash,
            PaymentStatus = PaymentStatus.Pending,
            OrderNumber = "ORD-TEST-006"
        };
        Context.Orders.Add(order);
        await Context.SaveChangesAsync();

        var request = new { UpiVpa = "user@upi" };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/v1/employee/orders/{order.Id}/upi/initiate", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeFalse();
        result.ErrorInfo!.Code.Should().Be("VALIDATION_ERROR");
    }
}
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using FoodTech.Api.Models;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Tests.Fixtures;
using Xunit;

namespace FoodTech.Tests.Integration;

public class VendorControllerTests : BaseIntegrationTest
{
    private User _vendorUser = null!;
    private VendorProfile _vendorProfile = null!;
    private string _vendorToken = string.Empty;

    public VendorControllerTests(CustomWebApplicationFactory factory) : base(factory) { }

    private async Task SetupVendorAsync()
    {
        _vendorUser = await CreateTestUserAsync("vendor@test.com", "Test@123", UserRole.Vendor, "Test Vendor");
        _vendorProfile = await CreateTestVendorAsync(_vendorUser.Id, "Test Business", "GST123456789");
        _vendorToken = GenerateJwtToken(_vendorUser, _vendorProfile.Id);
        SetAuthHeader(_vendorToken);
    }

    [Fact]
    public async Task GetProfile_ValidVendor_ShouldReturnProfile()
    {
        // Arrange
        await SetupVendorAsync();

        // Act
        var response = await Client.GetAsync("/api/v1/vendor/profile");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<VendorProfileDto>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.BusinessName.Should().Be("Test Business");
        result.Data.GstNumber.Should().Be("GST123456789");
    }

    [Fact]
    public async Task GetProfile_WithoutAuth_ShouldReturnUnauthorized()
    {
        // Arrange
        ClearAuthHeader();

        // Act
        var response = await Client.GetAsync("/api/v1/vendor/profile");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdateProfile_ValidData_ShouldUpdateProfile()
    {
        // Arrange
        await SetupVendorAsync();

        var request = new
        {
            BusinessName = "Updated Business",
            GstNumber = "GST987654321",
            Address = new
            {
                Street = "456 New St",
                City = "New City",
                State = "NS",
                PostalCode = "54321",
                Country = "India"
            },
            OperatingHours = new
            {
                Monday = new { IsOpen = true, OpenTime = "10:00", CloseTime = "21:00" },
                Tuesday = new { IsOpen = true, OpenTime = "10:00", CloseTime = "21:00" },
                Wednesday = new { IsOpen = true, OpenTime = "10:00", CloseTime = "21:00" },
                Thursday = new { IsOpen = true, OpenTime = "10:00", CloseTime = "21:00" },
                Friday = new { IsOpen = true, OpenTime = "10:00", CloseTime = "21:00" },
                Saturday = new { IsOpen = true, OpenTime = "11:00", CloseTime = "22:00" },
                Sunday = new { IsOpen = false }
            }
        };

        // Act
        var response = await Client.PatchAsJsonAsync("/api/v1/vendor/profile", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<VendorProfileDto>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.BusinessName.Should().Be("Updated Business");
        result.Data.GstNumber.Should().Be("GST987654321");
    }

    [Fact]
    public async Task GetMenu_EmptyMenu_ShouldReturnEmptyArray()
    {
        // Arrange
        await SetupVendorAsync();

        // Act
        var response = await Client.GetAsync("/api/v1/vendor/menu");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<MenuItemDto[]>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.Should().BeEmpty();
    }

    [Fact]
    public async Task CreateMenuItem_ValidData_ShouldCreateItem()
    {
        // Arrange
        await SetupVendorAsync();

        var request = new
        {
            Name = "Paneer Butter Masala",
            Description = "Creamy paneer curry",
            Price = 250,
            Category = "MainCourse",
            DietType = "Vegetarian",
            ImageUrl = "https://example.com/paneer.jpg",
            PrepTimeMinutes = 20,
            Tags = new[] { "popular", "spicy" }
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/vendor/menu", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var result = await DeserializeResponse<ApiResponse<MenuItemDto>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.Name.Should().Be("Paneer Butter Masala");
        result.Data.Price.Should().Be(25000); // Stored in paise
        result.Data.IsAvailable.Should().BeTrue();
    }

    [Fact]
    public async Task CreateMenuItem_InvalidPrice_ShouldReturnValidationError()
    {
        // Arrange
        await SetupVendorAsync();

        var request = new
        {
            Name = "Test Item",
            Description = "Test",
            Price = -100, // Invalid
            Category = "MainCourse",
            DietType = "Vegetarian"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/vendor/menu", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeFalse();
        result.ErrorInfo!.Code.Should().Be("VALIDATION_ERROR");
    }

    [Fact]
    public async Task UpdateMenuItem_ValidData_ShouldUpdateItem()
    {
        // Arrange
        await SetupVendorAsync();

        var createRequest = new
        {
            Name = "Original Name",
            Description = "Original",
            Price = 100,
            Category = "MainCourse",
            DietType = "Vegetarian"
        };
        var createResponse = await Client.PostAsJsonAsync("/api/v1/vendor/menu", createRequest);
        var createResult = await DeserializeResponse<ApiResponse<MenuItemDto>>(createResponse);
        var itemId = createResult!.Data!.Id;

        var updateRequest = new
        {
            Name = "Updated Name",
            Price = 150,
            IsAvailable = false
        };

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/v1/vendor/menu/{itemId}", updateRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<MenuItemDto>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.Name.Should().Be("Updated Name");
        result.Data.Price.Should().Be(15000);
        result.Data.IsAvailable.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteMenuItem_ExistingItem_ShouldDelete()
    {
        // Arrange
        await SetupVendorAsync();

        var createRequest = new
        {
            Name = "To Delete",
            Description = "Test",
            Price = 100,
            Category = "MainCourse",
            DietType = "Vegetarian"
        };
        var createResponse = await Client.PostAsJsonAsync("/api/v1/vendor/menu", createRequest);
        var createResult = await DeserializeResponse<ApiResponse<MenuItemDto>>(createResponse);
        var itemId = createResult!.Data!.Id;

        // Act
        var response = await Client.DeleteAsync($"/api/v1/vendor/menu/{itemId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeTrue();
    }

    [Fact]
    public async Task GetOrders_ShouldReturnKanbanGroupedOrders()
    {
        // Arrange
        await SetupVendorAsync();

        var employee = await CreateTestUserAsync("emp@test.com", "Test@123", UserRole.Employee);
        var menuItem = await CreateTestMenuItemAsync(_vendorProfile.Id, "Test Item", 100);

        var order = new Order
        {
            EmployeeId = employee.Id,
            VendorId = _vendorProfile.Id,
            Items = new[] { new OrderItem { MenuItemId = menuItem.Id, Name = menuItem.Name, Price = menuItem.Price, Quantity = 1, DietType = menuItem.DietType } },
            Status = OrderStatus.Pending,
            Subtotal = 10000,
            TaxAmount = 500,
            Total = 10500,
            PaymentMethod = PaymentMethod.Upi,
            PaymentStatus = PaymentStatus.Pending,
            OrderNumber = "ORD-TEST-001"
        };
        Context.Orders.Add(order);
        await Context.SaveChangesAsync();

        // Act
        var response = await Client.GetAsync("/api/v1/vendor/orders");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<VendorOrdersResponse>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.Pending.Should().HaveCount(1);
        result.Data.Confirmed.Should().BeEmpty();
        result.Data.Preparing.Should().BeEmpty();
        result.Data.Ready.Should().BeEmpty();
        result.Data.Completed.Should().BeEmpty();
        result.Data.Cancelled.Should().BeEmpty();
    }

    [Fact]
    public async Task UpdateOrderStatus_ValidTransition_ShouldUpdate()
    {
        // Arrange
        await SetupVendorAsync();

        var employee = await CreateTestUserAsync("emp2@test.com", "Test@123", UserRole.Employee);
        var menuItem = await CreateTestMenuItemAsync(_vendorProfile.Id, "Test Item", 100);

        var order = new Order
        {
            EmployeeId = employee.Id,
            VendorId = _vendorProfile.Id,
            Items = new[] { new OrderItem { MenuItemId = menuItem.Id, Name = menuItem.Name, Price = menuItem.Price, Quantity = 1, DietType = menuItem.DietType } },
            Status = OrderStatus.Pending,
            Subtotal = 10000,
            TaxAmount = 500,
            Total = 10500,
            PaymentMethod = PaymentMethod.Upi,
            PaymentStatus = PaymentStatus.Pending,
            OrderNumber = "ORD-TEST-002"
        };
        Context.Orders.Add(order);
        await Context.SaveChangesAsync();

        var request = new { Status = "Confirmed" };

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/v1/vendor/orders/{order.Id}/status", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<OrderDto>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.Status.Should().Be(OrderStatus.Confirmed);
    }

    [Fact]
    public async Task UpdateOrderStatus_InvalidTransition_ShouldReturnError()
    {
        // Arrange
        await SetupVendorAsync();

        var employee = await CreateTestUserAsync("emp3@test.com", "Test@123", UserRole.Employee);
        var menuItem = await CreateTestMenuItemAsync(_vendorProfile.Id, "Test Item", 100);

        var order = new Order
        {
            EmployeeId = employee.Id,
            VendorId = _vendorProfile.Id,
            Items = new[] { new OrderItem { MenuItemId = menuItem.Id, Name = menuItem.Name, Price = menuItem.Price, Quantity = 1, DietType = menuItem.DietType } },
            Status = OrderStatus.Pending,
            Subtotal = 10000,
            TaxAmount = 500,
            Total = 10500,
            PaymentMethod = PaymentMethod.Upi,
            PaymentStatus = PaymentStatus.Pending,
            OrderNumber = "ORD-TEST-003"
        };
        Context.Orders.Add(order);
        await Context.SaveChangesAsync();

        // Try to jump from Pending to Ready (invalid)
        var request = new { Status = "Ready" };

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/v1/vendor/orders/{order.Id}/status", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeFalse();
        result.ErrorInfo!.Code.Should().Be("VALIDATION_ERROR");
    }
}
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

public class SuperAdminControllerTests : BaseIntegrationTest
{
    private User _superAdminUser = null!;
    private User _vendorUser = null!;
    private VendorProfile _vendorProfile = null!;
    private string _superAdminToken = string.Empty;

    public SuperAdminControllerTests(CustomWebApplicationFactory factory) : base(factory) { }

    private async Task SetupSuperAdminAsync()
    {
        _superAdminUser = await CreateTestUserAsync("superadmin@test.com", "Test@123", UserRole.SuperAdmin, "Super Admin");
        _vendorUser = await CreateTestUserAsync("vendor@test.com", "Test@123", UserRole.Vendor, "Test Vendor");
        _vendorProfile = await CreateTestVendorAsync(_vendorUser.Id, "Pending Vendor", "GST123456789");
        // Make vendor not approved initially
        _vendorProfile.IsApproved = false;
        Context.VendorProfiles.Update(_vendorProfile);
        await Context.SaveChangesAsync();

        _superAdminToken = GenerateJwtToken(_superAdminUser);
        SetAuthHeader(_superAdminToken);
    }

    [Fact]
    public async Task GetVendors_ShouldReturnAllVendors()
    {
        // Arrange
        await SetupSuperAdminAsync();

        // Act
        var response = await Client.GetAsync("/api/v1/superadmin/vendors");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<List<SuperAdminVendorDto>>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.Should().HaveCount(1);
        result.Data[0].BusinessName.Should().Be("Pending Vendor");
        result.Data[0].IsApproved.Should().BeFalse();
    }

    [Fact]
    public async Task ApproveVendor_ValidRequest_ShouldApprove()
    {
        // Arrange
        await SetupSuperAdminAsync();

        var request = new { Approve = true };

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/v1/superadmin/vendors/{_vendorProfile.Id}/approve", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<SuperAdminVendorDto>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.IsApproved.Should().BeTrue();
        result.Data.ApprovedBy.Should().Be(_superAdminUser.Id);
        result.Data.ApprovedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task RejectVendor_ValidRequest_ShouldReject()
    {
        // Arrange
        await SetupSuperAdminAsync();
        // First approve
        _vendorProfile.IsApproved = true;
        Context.VendorProfiles.Update(_vendorProfile);
        await Context.SaveChangesAsync();

        var request = new { Approve = false };

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/v1/superadmin/vendors/{_vendorProfile.Id}/approve", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<SuperAdminVendorDto>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.IsApproved.Should().BeFalse();
        result.Data.ApprovedAt.Should().BeNull();
    }

    [Fact]
    public async Task GetUsers_ShouldReturnAllUsers()
    {
        // Arrange
        await SetupSuperAdminAsync();

        // Add another user
        await CreateTestUserAsync("another@test.com", "Test@123", UserRole.Employee);

        // Act
        var response = await Client.GetAsync("/api/v1/superadmin/users");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<SuperAdminUserDto[]>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.Should().HaveCount(3); // superadmin, vendor, employee
    }

    [Fact]
    public async Task UpdateUserStatus_DeactivateUser_ShouldDeactivate()
    {
        // Arrange
        await SetupSuperAdminAsync();

        var employee = await CreateTestUserAsync("to_deactivate@test.com", "Test@123", UserRole.Employee);

        var request = new { IsActive = false };

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/v1/superadmin/users/{employee.Id}/status", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<SuperAdminUserDto>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateUserStatus_ActivateUser_ShouldActivate()
    {
        // Arrange
        await SetupSuperAdminAsync();

        var employee = await CreateTestUserAsync("to_activate@test.com", "Test@123", UserRole.Employee);
        // Deactivate first
        employee.IsActive = false;
        Context.Users.Update(employee);
        await Context.SaveChangesAsync();

        var request = new { IsActive = true };

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/v1/superadmin/users/{employee.Id}/status", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<SuperAdminUserDto>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task GetDashboardAnalytics_ShouldReturnStats()
    {
        // Arrange
        await SetupSuperAdminAsync();

        // Create some test orders
        var employee = await CreateTestUserAsync("emp@test.com", "Test@123", UserRole.Employee);
        var menuItem = await CreateTestMenuItemAsync(_vendorProfile.Id, "Test Item", 100);

        var order1 = new Order
        {
            EmployeeId = employee.Id,
            VendorId = _vendorProfile.Id,
            Items = new[] { new OrderItem { MenuItemId = menuItem.Id, Name = menuItem.Name, Price = menuItem.Price, Quantity = 1, DietType = menuItem.DietType } },
            Status = OrderStatus.Completed,
            Subtotal = 10000,
            TaxAmount = 500,
            Total = 10500,
            PaymentMethod = PaymentMethod.Upi,
            PaymentStatus = PaymentStatus.Paid,
            OrderNumber = "ORD-DASH-001"
        };
        var order2 = new Order
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
            OrderNumber = "ORD-DASH-002"
        };
        Context.Orders.Add(order1);
        Context.Orders.Add(order2);
        await Context.SaveChangesAsync();

        // Act
        var response = await Client.GetAsync("/api/v1/superadmin/analytics/dashboard");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetOrderAnalytics_ShouldReturnDailyStats()
    {
        // Arrange
        await SetupSuperAdminAsync();

        // Act
        var response = await Client.GetAsync("/api/v1/superadmin/analytics/orders");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetRevenueAnalytics_ShouldReturnRevenueData()
    {
        // Arrange
        await SetupSuperAdminAsync();

        // Act
        var response = await Client.GetAsync("/api/v1/superadmin/analytics/revenue");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetVendorPerformance_ShouldReturnPerformance()
    {
        // Arrange
        await SetupSuperAdminAsync();

        // Act
        var response = await Client.GetAsync("/api/v1/superadmin/analytics/vendors");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
    }
}
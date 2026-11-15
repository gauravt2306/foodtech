using System.Net;
using System.Text.Json;
using FluentAssertions;
using FoodTech.Api.Models;
using FoodTech.Domain.Entities;
using FoodTech.Domain.Enums;
using FoodTech.Tests.Fixtures;
using System.Net.Http.Json;
using Xunit;

namespace FoodTech.Tests.Integration;

public class AuthControllerTests : BaseIntegrationTest
{
    public AuthControllerTests(CustomWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Register_Employee_ShouldReturnTokensAndUser()
    {
        // Arrange
        var request = new
        {
            Email = "employee@test.com",
            Password = "Test@123",
            Name = "Test Employee",
            Role = "employee",
            Phone = "+919876543210"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<AuthResponse>>(response);
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.AccessToken.Should().NotBeNullOrEmpty();
        result.Data.RefreshToken.Should().NotBeNullOrEmpty();
        result.Data.User.Email.Should().Be("employee@test.com");
        result.Data.User.Role.Should().Be(UserRole.Employee);
    }

    [Fact]
    public async Task Register_Vendor_ShouldReturnTokensAndUser()
    {
        // Arrange
        var request = new
        {
            Email = "vendor@test.com",
            Password = "Test@123",
            Name = "Test Vendor",
            Role = "vendor",
            Phone = "+919876543211"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<AuthResponse>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.User.Role.Should().Be(UserRole.Vendor);
    }

    [Fact]
    public async Task Register_DuplicateEmail_ShouldReturnConflict()
    {
        // Arrange
        await CreateTestUserAsync("duplicate@test.com", "Test@123", UserRole.Employee);

        var request = new
        {
            Email = "duplicate@test.com",
            Password = "Test@123",
            Name = "Another User",
            Role = "employee"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeFalse();
        result.ErrorInfo!.Code.Should().Be("CONFLICT");
    }

    [Fact]
    public async Task Login_ValidCredentials_ShouldReturnTokens()
    {
        // Arrange
        await CreateTestUserAsync("login@test.com", "Test@123", UserRole.Employee);

        var request = new
        {
            Email = "login@test.com",
            Password = "Test@123"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<AuthResponse>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.AccessToken.Should().NotBeNullOrEmpty();
        result.Data.RefreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_InvalidPassword_ShouldReturnUnauthorized()
    {
        // Arrange
        await CreateTestUserAsync("login2@test.com", "Test@123", UserRole.Employee);

        var request = new
        {
            Email = "login2@test.com",
            Password = "WrongPassword"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeFalse();
        result.ErrorInfo!.Code.Should().Be("UNAUTHORIZED");
    }

    [Fact]
    public async Task RefreshToken_ValidToken_ShouldReturnNewTokens()
    {
        // Arrange
        var user = await CreateTestUserAsync("refresh@test.com", "Test@123", UserRole.Employee);
        var loginRequest = new { Email = "refresh@test.com", Password = "Test@123" };
        var loginResponse = await Client.PostAsJsonAsync("/api/v1/auth/login", loginRequest);
        var loginResult = await DeserializeResponse<ApiResponse<AuthResponse>>(loginResponse);

        var refreshRequest = new { RefreshToken = loginResult!.Data!.RefreshToken };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/auth/refresh", refreshRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task RefreshToken_InvalidToken_ShouldReturnUnauthorized()
    {
        // Arrange
        var request = new { RefreshToken = "invalid-token" };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/auth/refresh", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Me_Authenticated_ShouldReturnUser()
    {
        // Arrange
        var user = await CreateTestUserAsync("me@test.com", "Test@123", UserRole.Employee);
        var token = GenerateJwtToken(user);
        SetAuthHeader(token);

        // Act
        var response = await Client.GetAsync("/api/v1/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<ApiResponse<MeResponse>>(response);
        result!.Success.Should().BeTrue();
        result.Data!.User.Email.Should().Be("me@test.com");
    }

    [Fact]
    public async Task Me_WithoutToken_ShouldReturnUnauthorized()
    {
        // Arrange
        ClearAuthHeader();

        // Act
        var response = await Client.GetAsync("/api/v1/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Register_InvalidEmail_ShouldReturnValidationError()
    {
        // Arrange
        var request = new
        {
            Email = "invalid-email",
            Password = "Test@123",
            Name = "Test",
            Role = "employee"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeFalse();
        result.ErrorInfo!.Code.Should().Be("VALIDATION_ERROR");
    }

    [Fact]
    public async Task Register_ShortPassword_ShouldReturnValidationError()
    {
        // Arrange
        var request = new
        {
            Email = "test@test.com",
            Password = "123",
            Name = "Test",
            Role = "employee"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var result = await DeserializeResponse<ApiResponse<object>>(response);
        result!.Success.Should().BeFalse();
        result.ErrorInfo!.Code.Should().Be("VALIDATION_ERROR");
    }
}
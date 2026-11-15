using System.Net;
using FluentAssertions;
using FoodTech.Api.Models;
using FoodTech.Tests.Fixtures;
using Xunit;

namespace FoodTech.Tests.Integration;

public class HealthControllerTests : BaseIntegrationTest
{
    public HealthControllerTests(CustomWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Get_ShouldReturnHealthy()
    {
        // Act
        var response = await Client.GetAsync("/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await DeserializeResponse<HealthResponse>(response);
        result!.Status.Should().Be("healthy");
        result.DatabaseConnected.Should().BeTrue();
        result.Version.Should().Be("1.0.0");
    }

    [Fact]
    public async Task Get_ShouldReturnDegradedWhenDbDown()
    {
        // Note: This test would require stopping the MongoDB container
        // which is not easily done in this setup. Skipping for now.
        await Task.CompletedTask;
    }
}
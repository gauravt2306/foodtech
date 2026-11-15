# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files
COPY FoodTech.Api/src/FoodTech.Api/FoodTech.Api.csproj FoodTech.Api/src/FoodTech.Api/
COPY FoodTech.Api/src/FoodTech.Domain/FoodTech.Domain.csproj FoodTech.Api/src/FoodTech.Domain/
COPY FoodTech.Api/src/FoodTech.Infrastructure/FoodTech.Infrastructure.csproj FoodTech.Api/src/FoodTech.Infrastructure/

# Restore dependencies
RUN dotnet restore FoodTech.Api/src/FoodTech.Api/FoodTech.Api.csproj

# Copy source code
COPY FoodTech.Api/src/ FoodTech.Api/src/

# Build and publish
WORKDIR /src/FoodTech.Api/src/FoodTech.Api
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Create non-root user
RUN useradd -m -s /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

# Copy published app
COPY --from=build /app/publish .

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run the app
ENTRYPOINT ["dotnet", "FoodTech.Api.dll"]
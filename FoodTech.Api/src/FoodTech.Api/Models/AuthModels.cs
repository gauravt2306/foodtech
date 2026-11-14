using FoodTech.Domain.Enums;

namespace FoodTech.Api.Models;

public record RegisterRequest(
    string Email,
    string Password,
    string Name,
    UserRole Role,
    string? Phone = null
);

public record LoginRequest(
    string Email,
    string Password
);

public record RefreshTokenRequest(
    string RefreshToken
);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    UserDto User
);

public record UserDto(
    string Id,
    string Email,
    string Name,
    UserRole Role,
    string? Phone,
    string? AvatarUrl,
    bool IsActive,
    string? VendorProfileId,
    DateTime? LastLoginAt,
    DateTime CreatedAt
);

public record MeResponse(
    UserDto User,
    VendorProfileDto? VendorProfile
);

public record VendorProfileDto(
    string Id,
    string UserId,
    string BusinessName,
    string GstNumber,
    AddressDto Address,
    OperatingHoursDto OperatingHours,
    bool IsApproved,
    string? ApprovedBy,
    DateTime? ApprovedAt,
    double Rating,
    long TotalOrders,
    DateTime CreatedAt
);

public record AddressDto(
    string Street,
    string City,
    string State,
    string Pincode
);

public record OperatingHoursDto(
    string Open,
    string Close
);
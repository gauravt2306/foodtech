using FluentValidation;
using FoodTech.Api.Models;
using FoodTech.Domain.Enums;

namespace FoodTech.Api.Validators;

public class UpdateVendorProfileRequestValidator : AbstractValidator<UpdateVendorProfileRequest>
{
    public UpdateVendorProfileRequestValidator()
    {
        RuleFor(x => x.BusinessName)
            .NotEmpty().WithMessage("Business name is required")
            .MaximumLength(150).WithMessage("Business name must not exceed 150 characters");

        RuleFor(x => x.GstNumber)
            .NotEmpty().WithMessage("GST number is required")
            .Matches(@"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")
            .WithMessage("Invalid GST number format");

        RuleFor(x => x.Address)
            .NotNull().WithMessage("Address is required")
            .SetValidator(new AddressDtoValidator());

        RuleFor(x => x.OperatingHours)
            .NotNull().WithMessage("Operating hours is required")
            .SetValidator(new OperatingHoursDtoValidator());
    }
}

public class AddressDtoValidator : AbstractValidator<AddressDto>
{
    public AddressDtoValidator()
    {
        RuleFor(x => x.Street)
            .NotEmpty().WithMessage("Street is required")
            .MaximumLength(200);

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required")
            .MaximumLength(100);

        RuleFor(x => x.State)
            .NotEmpty().WithMessage("State is required")
            .MaximumLength(100);

        RuleFor(x => x.Pincode)
            .NotEmpty().WithMessage("Pincode is required")
            .Matches(@"^\d{6}$").WithMessage("Pincode must be 6 digits");
    }
}

public class OperatingHoursDtoValidator : AbstractValidator<OperatingHoursDto>
{
    public OperatingHoursDtoValidator()
    {
        RuleFor(x => x.Open)
            .NotEmpty().WithMessage("Opening time is required")
            .Matches(@"^([01]\d|2[0-3]):([0-5]\d)$").WithMessage("Invalid time format (HH:MM)");

        RuleFor(x => x.Close)
            .NotEmpty().WithMessage("Closing time is required")
            .Matches(@"^([01]\d|2[0-3]):([0-5]\d)$").WithMessage("Invalid time format (HH:MM)");
    }
}

public class CreateMenuItemRequestValidator : AbstractValidator<CreateMenuItemRequest>
{
    public CreateMenuItemRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be non-negative");

        RuleFor(x => x.Category)
            .IsInEnum().WithMessage("Invalid category");

        RuleFor(x => x.DietType)
            .IsInEnum().WithMessage("Invalid diet type");

        RuleFor(x => x.PrepTimeMinutes)
            .InclusiveBetween(1, 120).WithMessage("Prep time must be between 1 and 120 minutes");

        RuleFor(x => x.Tags)
            .Must(tags => tags == null || tags.Length <= 10).WithMessage("Maximum 10 tags allowed");
    }
}

public class UpdateMenuItemRequestValidator : AbstractValidator<UpdateMenuItemRequest>
{
    public UpdateMenuItemRequestValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(100).When(x => x.Name != null).WithMessage("Name must not exceed 100 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).When(x => x.Description != null).WithMessage("Description must not exceed 500 characters");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).When(x => x.Price.HasValue).WithMessage("Price must be non-negative");

        RuleFor(x => x.Category)
            .IsInEnum().When(x => x.Category.HasValue).WithMessage("Invalid category");

        RuleFor(x => x.DietType)
            .IsInEnum().When(x => x.DietType.HasValue).WithMessage("Invalid diet type");

        RuleFor(x => x.PrepTimeMinutes)
            .InclusiveBetween(1, 120).When(x => x.PrepTimeMinutes.HasValue).WithMessage("Prep time must be between 1 and 120 minutes");

        RuleFor(x => x.Tags)
            .Must(tags => tags == null || tags.Length <= 10).WithMessage("Maximum 10 tags allowed");
    }
}

public class UpdateOrderStatusRequestValidator : AbstractValidator<UpdateOrderStatusRequest>
{
    public UpdateOrderStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid order status");
    }
}

public class HandoffOrderRequestValidator : AbstractValidator<HandoffOrderRequest>
{
    public HandoffOrderRequestValidator()
    {
        RuleFor(x => x.QrToken)
            .NotEmpty().WithMessage("QR token is required");
    }
}
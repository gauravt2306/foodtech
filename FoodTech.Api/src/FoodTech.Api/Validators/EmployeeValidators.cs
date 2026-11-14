using FluentValidation;
using FoodTech.Api.Models;
using FoodTech.Domain.Enums;

namespace FoodTech.Api.Validators;

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.VendorId)
            .NotEmpty().WithMessage("Vendor ID is required");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Order must have at least one item")
            .Must(items => items.Length > 0).WithMessage("Order must have at least one item");

        RuleForEach(x => x.Items).SetValidator(new OrderItemRequestValidator());

        RuleFor(x => x.PaymentMethod)
            .IsInEnum().WithMessage("Invalid payment method");

        RuleFor(x => x.SpecialInstructions)
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.SpecialInstructions))
            .WithMessage("Special instructions must not exceed 500 characters");
    }
}

public class OrderItemRequestValidator : AbstractValidator<OrderItemRequest>
{
    public OrderItemRequestValidator()
    {
        RuleFor(x => x.MenuItemId)
            .NotEmpty().WithMessage("Menu item ID is required");

        RuleFor(x => x.Quantity)
            .InclusiveBetween(1, 50).WithMessage("Quantity must be between 1 and 50");
    }
}

public class PayOrderRequestValidator : AbstractValidator<PayOrderRequest>
{
    public PayOrderRequestValidator()
    {
        RuleFor(x => x.PaymentId)
            .NotEmpty().WithMessage("Payment ID is required")
            .When(x => !string.IsNullOrEmpty(x.PaymentId));
    }
}

public class UpiPaymentInitiateRequestValidator : AbstractValidator<UpiPaymentInitiateRequest>
{
    public UpiPaymentInitiateRequestValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("Order ID is required");

        RuleFor(x => x.UpiVpa)
            .NotEmpty().WithMessage("UPI VPA is required")
            .Matches(@"^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$")
            .WithMessage("Invalid UPI VPA format (e.g., user@upi)");
    }
}

public class UpiPaymentCallbackRequestValidator : AbstractValidator<UpiPaymentCallbackRequest>
{
    public UpiPaymentCallbackRequestValidator()
    {
        RuleFor(x => x.TransactionRef)
            .NotEmpty().WithMessage("Transaction reference is required");

        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required")
            .Must(s => s.Equals("SUCCESS", StringComparison.OrdinalIgnoreCase) ||
                       s.Equals("FAILURE", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Status must be SUCCESS or FAILURE");
    }
}
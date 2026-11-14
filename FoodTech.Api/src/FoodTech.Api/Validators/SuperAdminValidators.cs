using FluentValidation;
using FoodTech.Api.Models;

namespace FoodTech.Api.Validators;

public class ApproveVendorRequestValidator : AbstractValidator<ApproveVendorRequest>
{
    public ApproveVendorRequestValidator()
    {
        // No specific validation needed for boolean
    }
}

public class UpdateUserStatusRequestValidator : AbstractValidator<UpdateUserStatusRequest>
{
    public UpdateUserStatusRequestValidator()
    {
        // No specific validation needed for boolean
    }
}
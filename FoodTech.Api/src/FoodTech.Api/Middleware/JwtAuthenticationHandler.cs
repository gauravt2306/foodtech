using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using FoodTech.Infrastructure.Auth;

namespace FoodTech.Api.Middleware;

public class JwtAuthenticationHandler : JwtBearerHandler
{
    public JwtAuthenticationHandler(
        IOptionsMonitor<JwtBearerOptions> options,
        ILoggerFactory logger,
        System.Text.Encodings.Web.UrlEncoder encoder,
        IOptions<JwtSettings> jwtSettings)
        : base(options, logger, encoder)
    {
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var result = await base.HandleAuthenticateAsync();

        if (result.Succeeded && result.Principal != null)
        {
            // Add vendorProfileId claim if present
            var vendorProfileId = result.Principal.FindFirst("vendorProfileId")?.Value;
            if (!string.IsNullOrEmpty(vendorProfileId))
            {
                var claims = new List<Claim>(result.Principal.Claims);
                // Ensure vendorProfileId is available
            }
        }

        return result;
    }
}
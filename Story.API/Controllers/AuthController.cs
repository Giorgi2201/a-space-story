using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Story.API.DTOs;
using Story.API.Models;
using Story.API.Services;

namespace Story.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    JwtTokenService jwtTokenService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var errors = AuthValidation.ValidateRegister(request);
        if (errors.Count > 0)
        {
            return BadRequest(new { errors });
        }

        var normalizedEmail = userManager.NormalizeEmail(request.Email);
        var emailTaken = await userManager.Users
            .AnyAsync(user => user.NormalizedEmail == normalizedEmail);
        if (emailTaken)
        {
            return BadRequest(new
            {
                errors = new Dictionary<string, string>
                {
                    ["Email"] = "Email is already registered",
                },
            });
        }

        var (firstName, lastName) = NameParser.ParseFullName(request.FullName);

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = firstName,
            LastName = lastName,
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = MapIdentityErrors(result.Errors) });
        }

        return Ok(new AuthResponse
        {
            Token = jwtTokenService.GenerateToken(user),
            FirstName = user.FirstName,
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var errors = AuthValidation.ValidateLogin(request);
        if (errors.Count > 0)
        {
            return BadRequest(new { errors });
        }

        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return Unauthorized(new
            {
                errors = new Dictionary<string, string>
                {
                    ["Email"] = "Invalid email or password",
                },
            });
        }

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        if (!result.Succeeded)
        {
            return Unauthorized(new
            {
                errors = new Dictionary<string, string>
                {
                    ["Password"] = "Invalid email or password",
                },
            });
        }

        return Ok(new AuthResponse
        {
            Token = jwtTokenService.GenerateToken(user),
            FirstName = user.FirstName,
        });
    }

    private static Dictionary<string, string> MapIdentityErrors(IEnumerable<IdentityError> identityErrors)
    {
        var errors = new Dictionary<string, string>();

        foreach (var error in identityErrors)
        {
            var field = error.Code switch
            {
                "DuplicateUserName" or "DuplicateEmail" => "Email",
                "InvalidEmail" => "Email",
                "PasswordTooShort" or "PasswordRequiresDigit" or "PasswordRequiresUpper" => "Password",
                _ => "Form",
            };

            var message = field switch
            {
                "Email" when error.Code is "DuplicateUserName" or "DuplicateEmail" => "Email is already registered",
                "Email" when error.Code == "InvalidEmail" => "Email format is invalid",
                "Password" => "Password does not meet requirements",
                _ => error.Description,
            };

            errors[field] = message;
        }

        return errors;
    }
}

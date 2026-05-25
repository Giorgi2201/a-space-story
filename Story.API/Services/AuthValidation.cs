using System.ComponentModel.DataAnnotations;
using Story.API.DTOs;

namespace Story.API.Services;

public static class AuthValidation
{
    public static Dictionary<string, string> ValidateRegister(RegisterRequest request)
    {
        var errors = new Dictionary<string, string>();

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            errors["FullName"] = "Full name is required";
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            errors["Email"] = "Email is required";
        }
        else if (!new EmailAddressAttribute().IsValid(request.Email))
        {
            errors["Email"] = "Email format is invalid";
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            errors["Password"] = "Password is required";
        }
        else if (!IsValidPassword(request.Password))
        {
            errors["Password"] = "Password does not meet requirements";
        }

        if (string.IsNullOrWhiteSpace(request.ConfirmPassword))
        {
            errors["ConfirmPassword"] = "Confirm password is required";
        }
        else if (request.Password != request.ConfirmPassword)
        {
            errors["ConfirmPassword"] = "Passwords do not match";
        }

        return errors;
    }

    public static Dictionary<string, string> ValidateLogin(LoginRequest request)
    {
        var errors = new Dictionary<string, string>();

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            errors["Email"] = "Email is required";
        }
        else if (!new EmailAddressAttribute().IsValid(request.Email))
        {
            errors["Email"] = "Email format is invalid";
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            errors["Password"] = "Password is required";
        }

        return errors;
    }

    public static bool IsValidPassword(string password) =>
        password.Length is >= 8 and <= 20
        && password.Any(char.IsUpper)
        && password.Any(char.IsDigit);
}

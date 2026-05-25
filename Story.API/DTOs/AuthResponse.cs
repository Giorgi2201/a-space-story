namespace Story.API.DTOs;

public sealed class AuthResponse
{
    public string Token { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;
}

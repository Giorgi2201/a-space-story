namespace Story.API.Services;

public static class NameParser
{
    public static (string FirstName, string LastName) ParseFullName(string fullName)
    {
        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);

        return parts.Length switch
        {
            0 => (string.Empty, string.Empty),
            1 => (parts[0], string.Empty),
            _ => (parts[0], string.Join(' ', parts.Skip(1))),
        };
    }
}

using Npgsql;

const string connectionString =
    "Host=localhost;Port=5432;Database=aspacestory;Username=postgres;Password=postgres";

var targetEmail = args.FirstOrDefault();

await using var connection = new NpgsqlConnection(connectionString);
await connection.OpenAsync();

if (string.IsNullOrWhiteSpace(targetEmail))
{
    await using var list = new NpgsqlCommand(
        """
        SELECT mp."Id", u."Email", mp."Phase", mp."NarrativeSegmentIndex", mp."LastCompletedChapter"
        FROM "MissionProgresses" mp
        JOIN "AspNetUsers" u ON u."Id" = mp."UserId"
        WHERE mp."MissionKey" = 'laika'
        ORDER BY mp."Id" DESC;
        """,
        connection);

    await using var reader = await list.ExecuteReaderAsync();
    var rows = new List<(int Id, string Email, string Phase, int Segment, int Completed)>();

    while (await reader.ReadAsync())
    {
        rows.Add((
            reader.GetInt32(0),
            reader.GetString(1),
            reader.GetString(2),
            reader.GetInt32(3),
            reader.GetInt32(4)));
    }

    if (rows.Count == 0)
    {
        Console.WriteLine("No Laika mission progress found.");
        return;
    }

    if (rows.Count > 1)
    {
        Console.WriteLine("Multiple users have Laika progress. Pass email as argument, e.g.:");
        Console.WriteLine("  dotnet run -- user@example.com");
        Console.WriteLine();
        foreach (var row in rows)
        {
            Console.WriteLine(
                $"  {row.Email} — phase={row.Phase}, segment={row.Segment}, completedChapter={row.Completed}");
        }

        return;
    }

    targetEmail = rows[0].Email;
    Console.WriteLine($"Deleting Laika progress for: {targetEmail}");
}

await using var delete = new NpgsqlCommand(
    """
    DELETE FROM "MissionProgresses" mp
    USING "AspNetUsers" u
    WHERE u."Id" = mp."UserId"
      AND mp."MissionKey" = 'laika'
      AND LOWER(u."Email") = LOWER(@email);
    """,
    connection);

delete.Parameters.AddWithValue("email", targetEmail.Trim());
var deleted = await delete.ExecuteNonQueryAsync();

Console.WriteLine(deleted > 0
    ? $"Deleted {deleted} mission progress row(s) for {targetEmail}."
    : $"No Laika mission progress found for {targetEmail}.");

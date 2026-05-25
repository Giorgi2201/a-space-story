namespace Story.API.Models;

public sealed class MissionProgress
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string MissionKey { get; set; } = "laika";

    public int CurrentChapter { get; set; } = 1;

    public string Phase { get; set; } = "narrative";

    public int NarrativeSegmentIndex { get; set; }

    public int LastCompletedChapter { get; set; }
}

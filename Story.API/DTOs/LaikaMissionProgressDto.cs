namespace Story.API.DTOs;

public sealed class LaikaMissionProgressDto
{
    public string MissionId { get; set; } = "laika";

    public int CurrentChapter { get; set; } = 1;

    public string Phase { get; set; } = "narrative";

    public int NarrativeSegmentIndex { get; set; }

    public int LastCompletedChapter { get; set; }
}

public sealed class UpdateLaikaMissionProgressRequest
{
    public int CurrentChapter { get; set; } = 1;

    public string Phase { get; set; } = "narrative";

    public int NarrativeSegmentIndex { get; set; }

    public int? LastCompletedChapter { get; set; }
}

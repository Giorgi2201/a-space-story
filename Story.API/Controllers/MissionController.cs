using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Story.API.Data;
using Story.API.DTOs;
using Story.API.Models;

namespace Story.API.Controllers;

[Authorize]
[ApiController]
[Route("api/mission")]
public sealed class MissionController(ApplicationDbContext dbContext) : ControllerBase
{
    private const string LaikaMissionKey = "laika";

    [HttpGet("laika/progress")]
    public async Task<ActionResult<LaikaMissionProgressDto>> GetLaikaProgress(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var progress = await dbContext.MissionProgresses
            .AsNoTracking()
            .FirstOrDefaultAsync(
                entry => entry.UserId == userId && entry.MissionKey == LaikaMissionKey,
                cancellationToken);

        if (progress is null)
        {
            return Ok(new LaikaMissionProgressDto());
        }

        return Ok(MapToDto(progress));
    }

    [HttpPut("laika/progress")]
    public async Task<ActionResult<LaikaMissionProgressDto>> UpdateLaikaProgress(
        [FromBody] UpdateLaikaMissionProgressRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        if (!IsValidPhase(request.Phase))
        {
            return BadRequest(new { error = "Invalid mission phase." });
        }

        var progress = await dbContext.MissionProgresses
            .FirstOrDefaultAsync(
                entry => entry.UserId == userId && entry.MissionKey == LaikaMissionKey,
                cancellationToken);

        if (progress is null)
        {
            progress = new MissionProgress
            {
                UserId = userId,
                MissionKey = LaikaMissionKey,
            };
            dbContext.MissionProgresses.Add(progress);
        }

        progress.CurrentChapter = Math.Max(1, request.CurrentChapter);
        progress.Phase = request.Phase;
        progress.NarrativeSegmentIndex = Math.Max(0, request.NarrativeSegmentIndex);

        if (request.LastCompletedChapter.HasValue)
        {
            progress.LastCompletedChapter = Math.Max(progress.LastCompletedChapter, request.LastCompletedChapter.Value);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(MapToDto(progress));
    }

    [HttpPost("laika/chapters/1/complete")]
    public async Task<ActionResult<LaikaMissionProgressDto>> CompleteLaikaChapter1(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var progress = await dbContext.MissionProgresses
            .FirstOrDefaultAsync(
                entry => entry.UserId == userId && entry.MissionKey == LaikaMissionKey,
                cancellationToken);

        if (progress is null)
        {
            progress = new MissionProgress
            {
                UserId = userId,
                MissionKey = LaikaMissionKey,
            };
            dbContext.MissionProgresses.Add(progress);
        }

        progress.LastCompletedChapter = Math.Max(progress.LastCompletedChapter, 1);
        progress.CurrentChapter = 2;
        progress.Phase = "chapter2";
        progress.NarrativeSegmentIndex = 0;

        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(MapToDto(progress));
    }

    private static bool IsValidPhase(string phase) =>
        phase is "narrative" or "exercise" or "chapter2";

    private static LaikaMissionProgressDto MapToDto(MissionProgress progress) =>
        new()
        {
            MissionId = progress.MissionKey,
            CurrentChapter = progress.CurrentChapter,
            Phase = progress.Phase,
            NarrativeSegmentIndex = progress.NarrativeSegmentIndex,
            LastCompletedChapter = progress.LastCompletedChapter,
        };
}

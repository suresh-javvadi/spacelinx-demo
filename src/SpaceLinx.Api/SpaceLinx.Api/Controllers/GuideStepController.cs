using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using NpgsqlTypes;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;
using System.Data;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class GuideStepController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IGuideService guideService, IImageService imageService, IVideoService videoService) : 
    GenericRestController<GuideStep, GuideStepWriteModel, GuideStepUpdateModel, GuideStepReadModel, GuideStepRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("guide/{guideId}")]
    public async Task<List<GuideStepReadModel>> GetByGuide(Guid guideId)
    {
        var records = await spaceLinxContext.GuideSteps
        .AsNoTracking()
        .Include(x => x.Image)
        .Include(x => x.Video)
        .Where(x => x.GuideId == guideId && x.DeletedBy == null)
        .ToListAsync();

        return mapper.Map<List<GuideStep>, List<GuideStepReadModel>>(records);
    }

    [HttpPost("copy-step/{stepId}")]
    public async Task<IActionResult> CopyGuideStepAsync(Guid stepId)
    {
        var newStepIdParameter = new NpgsqlParameter("new_step_id", NpgsqlDbType.Uuid)
        {
            Direction = ParameterDirection.Output
        };
        var record = await GetAsync(stepId);
        if (record == null)
        {
            return NotFound();
        }

        await guideService.ValidateGuideStatusAsync(record.GuideId, "Guide is published, so cannot add new step.");

        await spaceLinxContext.Database.ExecuteSqlRawAsync(
            "call mes.copy_guide_step({0}, {1}, null)",
            stepId,
            UserEmail,
            newStepIdParameter
        );

        Guid newStepId = (Guid)newStepIdParameter.Value;
        return Ok(newStepId);
    }

    [HttpPost("reorder-step")]
    public async Task<IActionResult> ReorderStep(Guid guideStepId, int newSequence)
    {
        var guideStep = await GetAsync(guideStepId);
        if (guideStep == null)
        {
            return NotFound();
        }

        await guideService.ValidateGuideStatusAsync(guideStep.GuideId, "Guide is published, so the step cannot be reordered.");

        await spaceLinxContext.Database.ExecuteSqlRawAsync(
                        "call mes.reorder_guide_steps({0}, {1})",
                        guideStepId,
                        newSequence
                    );

        return NoContent();
    }

    [HttpPost("delete-reorder-steps/{guideStepId}")]
    public async Task<IActionResult> DeleteStep(Guid guideStepId)
    {
        var record = await spaceLinxContext.GuideSteps.FirstOrDefaultAsync(g => g.Id == guideStepId && g.DeletedBy == null);
        if (record == null)
        {
            throw new ApplicationException("Not Found");
        }

        await guideService.ValidateGuideStatusAsync(record.GuideId, "Guide is published, so the step cannot be deleted.");

        var guideId = record.GuideId;
        int deletedSequence = record.Sequence;
        spaceLinxContext.Entry(record).State = EntityState.Deleted;

        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            await spaceLinxContext.SaveChangesAsync();

            await spaceLinxContext.Database.ExecuteSqlRawAsync(
                            "call mes.reorder_guide_steps_after_deletion({0}, {1})",
                            guideId,
                            deletedSequence
                        );

            await transaction.CommitAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("bulk-delete-reorder")]
    public async Task<IActionResult> BulkDeleteSteps([FromBody] List<Guid> guideStepIds)
    {
        try
        {
            await guideService.BulkDeleteGuideStepsAsync(guideStepIds);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (ApplicationException ex) when (ex.Message == "No valid steps found to delete.")
        {
            return NotFound(ex.Message);
        }
        catch (ApplicationException ex) when (ex.Message == "Guide not found." || ex.Message.StartsWith("Guide is published"))
        {
            return BadRequest(ex.Message);
        }
        catch (ApplicationException ex) when (ex.Message.StartsWith("Internal server error"))
        {
            return StatusCode(500, ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("new-step/{guideId}")]
    public async Task<IActionResult> NewStep(Guid guideId, int newSequence)
    {
        GuideStepWriteModel newRecord = new GuideStepWriteModel();
        newRecord.GuideId = guideId;
        newRecord.Title = "No Title";
        newRecord.Sequence = 100000000;
        var newInsertedRecord = await CreateAsync(newRecord);
        if (newInsertedRecord == null)
        {
            throw new ApplicationException("New step is not saved");
        }

        await guideService.ValidateGuideStatusAsync(newRecord.GuideId, "Guide is published, so cannot add new step.");

        newInsertedRecord.Sequence = newSequence;

        await spaceLinxContext.Database.ExecuteSqlRawAsync(
                        "call mes.reorder_guide_steps({0}, {1})",
                        newInsertedRecord.Id,
                        newSequence
                    );

        return CreatedAtAction(nameof(Get), new { id = newInsertedRecord?.Id }, newInsertedRecord);
    }
    
    [HttpPut("{id}")]
    public override async Task<IActionResult> Update(Guid id, GuideStepUpdateModel updatedRecord)
    {
        var record = await GetAsync(id);
        if (record is null)
        {
            return NotFound();
        }

        await guideService.ValidateGuideStatusAsync(record.GuideId, "Guide is published, so cannot edit a published guide step.");

        updatedRecord.Id = record.Id;

        await UpdateAsync(id, updatedRecord);

        return NoContent();
    }

    [HttpPut("picture-upload/{id}")]
    public async Task<IActionResult> PictureUpload(Guid id, [FromForm] ImageWriteModel image)
    {
        var guideStep = await spaceLinxContext.GuideSteps.FirstOrDefaultAsync(gs => gs.Id == id && gs.DeletedBy == null);
        if (guideStep == null)
        {
            throw new ApplicationException("Guide Step does not exist");
        }

        await guideService.ValidateGuideStatusAsync(guideStep.GuideId, "Guide is published, so cannot edit a published guide step.");

        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            string imageType = string.IsNullOrEmpty(image.ImageType) ? "Image" : image.ImageType;
            var createdImage = image?.ImageFile != null
                                 ? await imageService.UploadImageAsync(image, guideStep.Id.Value, SpaceLinxEntities.GuideStep, imageType)
                                 : null;

            guideStep.ImageId = createdImage?.Id;
            guideStep.VideoId = null;

            await spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("video-upload/{id}")]
    public async Task<IActionResult> VideoUpload(Guid id, [FromForm] VideoWriteModel video)
    {
        var guideStep = await spaceLinxContext.GuideSteps.FirstOrDefaultAsync(gs => gs.Id == id && gs.DeletedBy == null);
        if (guideStep == null)
        {
            throw new ApplicationException("Guide Step does not exist");
        }

        await guideService.ValidateGuideStatusAsync(guideStep.GuideId, "Guide is published, so cannot edit a published guide step.");

        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var createdVideo = video?.VideoType == null
                                 ? await videoService.UploadVideoAsync(video, guideStep.Id.Value, SpaceLinxEntities.GuideStep, "Video")
                                 : await videoService.UploadVideoAsync(video, guideStep.Id.Value, SpaceLinxEntities.GuideStep);

            guideStep.VideoId = createdVideo?.Id;
            guideStep.ImageId = null;

            await spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public override async Task<IActionResult> Delete(Guid id)
    {
        var record = await GetAsync(id);
        if(record == null)
        {
            return NotFound();
        }

        await guideService.ValidateGuideStatusAsync(record.GuideId, "Guide is published, so step cannot be deleted.");
        
        await RemoveAsync(id);

        return NoContent();
    }
}
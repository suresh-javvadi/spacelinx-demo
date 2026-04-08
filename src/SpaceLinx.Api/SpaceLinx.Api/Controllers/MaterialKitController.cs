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
public class MaterialKitController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IImageService _imageService) :
    GenericRestController<MaterialKit, MaterialKitWriteModel, MaterialKitUpdateModel, MaterialKitReadModel, MaterialKitRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpPost("image")]
    public async Task<IActionResult> Post([FromForm] MaterialKitWriteModel newMaterialKit, [FromForm] ImageWriteModel image)
    {
        var newMaterialKitIdParameter = new NpgsqlParameter("new_material_kit_id", NpgsqlDbType.Uuid)
        {
            Direction = ParameterDirection.Output
        };

        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            Guid? imageId = null;

            await spaceLinxContext.Database.ExecuteSqlRawAsync(
                "call mes.create_material_kit_and_kits({0}, {1}, {2}, {3}, {4}, {5}, null)",
                newMaterialKit.Name,
                newMaterialKit.PartId,
                newMaterialKit.LocationId,
                imageId,
                newMaterialKit.Quantity,
                UserEmail,
                newMaterialKitIdParameter
            );

            var newMaterialKitId = (Guid)newMaterialKitIdParameter.Value;

            string imageType = string.IsNullOrEmpty(image.ImageType) ? "Image" : image.ImageType;
            var createdImage = image?.ImageFile != null
                     ? await _imageService.UploadImageAsync(image, newMaterialKitId, SpaceLinxEntities.MaterialKit, imageType)
                     : null;
            imageId = createdImage?.Id;

            var materialKit = await spaceLinxContext.MaterialKits.FindAsync(newMaterialKitId);
            materialKit.ImageId = imageId;

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(newMaterialKitId);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("picture-upload")]
    public async Task<IActionResult> PictureUpload(Guid id, [FromForm] ImageWriteModel image)
    {
        var record = await spaceLinxContext.MaterialKits.FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);
        if (record == null)
        {
            return NotFound("Material kit does not exist.");
        }

        if (image.ImageFile == null || image.ImageFile.Length == 0)
        {
            throw new ApplicationException("No image file provided");
        }

        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var createdImage = await _imageService.UploadImageAsync(image, id, SpaceLinxEntities.MaterialKit, "Image");
            if (createdImage == null)
            {
                throw new ApplicationException("Image upload failed");
            }

            record.ImageId = createdImage.Id;
            record.UpdatedBy = UserEmail;
            record.UpdatedAt = DateTime.UtcNow;

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}

using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class ProductController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IImageService _imageService) :
    GenericRestController<Product, ProductWriteModel, ProductUpdateModel, ProductReadModel, ProductRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("{id}/detail")]
    public async Task<ActionResult<ProductDetailReadModel>> GetProductDetail(Guid id)
    {
        var recordFromDatabase = await spaceLinxContext.Products
                                    .AsNoTracking()
                                    .Include(g => g.Image)
                                    .Include(g => g.Part)
                                    .Include(g => g.Platform)
                                    .SingleOrDefaultAsync(g => g.Id == id && g.Part.ItemType == null && g.DeletedBy == null);

        if (recordFromDatabase is null)
        {
            return NotFound();
        }

        var record = mapper.Map<ProductDetailReadModel>(recordFromDatabase);
        var guide = await spaceLinxContext.Guides.FirstOrDefaultAsync(x => x.PartId == recordFromDatabase.PartId);
        if (guide is not null)
        {
            record.Guide = mapper.Map<GuideRefModel>(guide);
        }

        return record;
    }

    [HttpGet("platform/{platformId}")]
    public async Task<List<ProductReadModel>> GetByPlatformAsync(Guid platformId)
    {
        var records = await spaceLinxContext.Products
        .AsNoTracking()
        .Include(x => x.Image)
        .Include(x => x.Part)
        .Where(x => x.PlatformId == platformId && x.Part.ItemType == null && x.DeletedBy == null)
        .ToListAsync();

        return mapper.Map<List<Product>, List<ProductReadModel>>(records);
    }

    [HttpGet("productNumber/{productNumber}")]
    public async Task<ProductReadModel> GetByNumberAsync(string productNumber)
    {
        var record = await spaceLinxContext.Products.AsNoTracking()
        .FirstOrDefaultAsync(x => x.Number == productNumber && x.DeletedBy == null);

        return mapper.Map<ProductReadModel>(record);
    }

    [HttpPost("image")]
    public async Task<IActionResult> Post([FromForm] ProductImageWriteModel newProduct, [FromForm] ImageWriteModel image)
    {
        var partRecord = spaceLinxContext.Parts.FirstOrDefault(x => x.Id == newProduct.PartId && x.Status == PartStatus.Release && x.DeletedBy == null);
        if (partRecord == null)
        {
            throw new ApplicationException("Part does not exist");
        }

        var product = mapper.Map<Product>(newProduct);

        product.CreatedBy = UserEmail;
        product.IsActive = true;

        if (product == null)
        {
            throw new ApplicationException("Failed to create a Product.");
        }

        spaceLinxContext.Products.Add(product);
        await spaceLinxContext.SaveChangesAsync();

        if (image.ImageFile != null)
        {
            using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
            try
            {
                var createdImage = await _imageService.UploadImageAsync(image, product.Id.Value, SpaceLinxEntities.Product);

                product.ImageId = createdImage?.Id;
                product.Image = createdImage;

                await spaceLinxContext.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        return CreatedAtAction(nameof(Get), new { id = product?.Id }, product);
    }

    [HttpPut("picture-upload/{productId}")]
    public async Task<IActionResult> PictureUpload(Guid productId, [FromForm] ImageWriteModel image)
    {
        var product = await spaceLinxContext.Products
            .FirstOrDefaultAsync(p => p.Id == productId && p.DeletedBy == null);
        if (product == null)
        {
            return NotFound("Product does not exist.");
        }

        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            product.Image = image?.ImageFile != null
                                 ? await _imageService.UploadImageAsync(image, productId, SpaceLinxEntities.Product, "Image")
                                 : null;

            product.ImageId = product?.Image?.Id;

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
}
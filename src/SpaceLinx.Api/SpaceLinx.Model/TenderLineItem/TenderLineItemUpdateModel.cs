using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model;

public partial class TenderLineItemUpdateModel : BaseUpdateModel
{
    public Guid TenderId { get; set; }

    [Required]
    public Guid PartId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    public Guid? UnitOfMeasureId { get; set; }
    public string? Description { get; set; }
    public string? Specifications { get; set; }
}

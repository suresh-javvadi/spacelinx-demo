using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model;

public partial class TenderWriteModel : BaseWriteModel
{
    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }
    public Guid? RequisitionId { get; set; }
    public Guid? ProjectId { get; set; }

    [Required]
    public DateOnly ClosingDate { get; set; }

    public Guid? BuyerId { get; set; }
    public string? Terms { get; set; }
    public Guid? PaymentTermId { get; set; }
    public Guid? CurrencyId { get; set; }
}

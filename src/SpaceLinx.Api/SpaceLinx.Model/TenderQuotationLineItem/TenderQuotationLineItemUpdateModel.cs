using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model;

public partial class TenderQuotationLineItemUpdateModel : BaseUpdateModel
{
    public Guid TenderQuotationId { get; set; }

    [Required]
    public Guid TenderLineItemId { get; set; }

    [Required]
    public decimal UnitPrice { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    public int? LeadTimeDays { get; set; }
    public string? Notes { get; set; }
}

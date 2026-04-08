using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model;

public partial class TenderVendorUpdateModel : BaseUpdateModel
{
    public Guid TenderId { get; set; }

    [Required]
    public Guid CompanyId { get; set; }

    public DateOnly? ResponseDeadline { get; set; }
    public string Status { get; set; } = null!;
    public string? Notes { get; set; }
}

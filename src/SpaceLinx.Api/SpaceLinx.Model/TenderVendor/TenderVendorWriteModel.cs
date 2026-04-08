using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model;

public partial class TenderVendorWriteModel : BaseWriteModel
{
    public Guid TenderId { get; set; }

    [Required]
    public Guid CompanyId { get; set; }

    public DateOnly? ResponseDeadline { get; set; }
    public string? Notes { get; set; }
}

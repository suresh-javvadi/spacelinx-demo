namespace SpaceLinx.Model;

public partial class TenderVendorReadModel : BaseReadModel
{
    public Guid TenderId { get; set; }
    public Guid CompanyId { get; set; }
    public DateTime InvitedDate { get; set; }
    public DateOnly? ResponseDeadline { get; set; }
    public string Status { get; set; } = null!;
    public string? Notes { get; set; }

    public virtual CompanyRefModel Company { get; set; } = null!;
}

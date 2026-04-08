namespace SpaceLinx.Model;

public partial class TenderVendor : BaseModel
{
    public Guid TenderId { get; set; }
    public Guid CompanyId { get; set; }
    public DateTime InvitedDate { get; set; }
    public DateOnly? ResponseDeadline { get; set; }
    public string Status { get; set; } = null!;
    public string? Notes { get; set; }

    // Navigation properties
    public virtual Tender Tender { get; set; } = null!;
    public virtual Company Company { get; set; } = null!;
}

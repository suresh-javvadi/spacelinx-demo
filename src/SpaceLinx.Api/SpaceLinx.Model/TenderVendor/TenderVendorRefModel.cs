namespace SpaceLinx.Model;

public partial class TenderVendorRefModel : BaseRefModel
{
    public Guid TenderId { get; set; }
    public Guid CompanyId { get; set; }
    public string Status { get; set; } = null!;
}

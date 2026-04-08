namespace SpaceLinx.Model;

public partial class CompanyPartRefModel : BaseRefModel
{
    public Guid CompanyId { get; set; }
    public Guid PartId { get; set; }
    public decimal? UnitPrice { get; set; }
    public string? VendorPartNumber { get; set; }
    public bool IsPreferred { get; set; }
    public int? LeadTimeDays { get; set; }
}
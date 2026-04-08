namespace SpaceLinx.Model;

public class OrganizationAlterModel : BaseUpdateModel
{
    public string Name { get; set; } = null!;
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string TaxNumber { get; set; } = null!;
}

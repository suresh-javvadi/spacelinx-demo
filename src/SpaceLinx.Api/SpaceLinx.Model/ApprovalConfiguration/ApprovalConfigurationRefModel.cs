namespace SpaceLinx.Model;

public partial class ApprovalConfigurationRefModel : BaseRefModel
{
    public string EntityType { get; set; } = null!;
    public int NumberOfLevels { get; set; }
}

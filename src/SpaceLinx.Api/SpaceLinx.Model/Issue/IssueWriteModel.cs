namespace SpaceLinx.Model;

public partial class IssueWriteModel : BaseWriteModel
{
    public string? ProjectName { get; set; }
    public string IssueType { get; set; } = null!;
    public string? Priority { get; set; }
    public string Summary { get; set; } = null!;
    public string? Description { get; set; }
    public Guid? ProductId { get; set; }
    public Guid? GuideId { get; set; }
    public Guid? WorkOrderId { get; set; }
    public string? JiraId { get; set; }
    public string? DevopsId { get; set; }
}
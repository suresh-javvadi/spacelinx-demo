namespace SpaceLinx.Model;

public partial class Issue : BaseModel
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
    public virtual Guide? Guide { get; set; }
    public virtual Product? Product { get; set; }
    public virtual WorkOrder? WorkOrder { get; set; }
}
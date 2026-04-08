namespace SpaceLinx.Model;

public partial class GrnLineItemsAcceptModel
{
    public List<Guid> LineItemIds { get; set; } = new();
    public Guid? ProjectId { get; set; }
    public string? Department { get; set; }
    public Guid? AssignedUserId { get; set; }
}
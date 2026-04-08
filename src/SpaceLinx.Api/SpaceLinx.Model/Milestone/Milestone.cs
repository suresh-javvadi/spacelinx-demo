namespace SpaceLinx.Model;

public partial class Milestone : BaseModel
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public Guid? ProjectId { get; set; }
    public DateTime? TargetDate { get; set; }
    public string Status { get; set; } = null!;
    public virtual Project? Project { get; set; }
    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
}
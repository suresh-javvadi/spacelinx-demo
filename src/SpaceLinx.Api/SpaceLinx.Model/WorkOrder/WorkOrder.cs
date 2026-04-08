namespace SpaceLinx.Model;

public partial class WorkOrder : BaseModel
{
    public string Name { get; set; } = null!;
    public string Number { get; set; } = null!;
    public string Status { get; set; } = null!;
    public Guid? WorkPackageId { get; set; }
    public Guid? KitId { get; set; }
    public Guid? TechnicianId { get; set; }
    public Guid? ManagerId { get; set; }
    public Guid? GuideId { get; set; }
    public Guid PartId { get; set; }
    public Guid? ProductId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public TimeSpan? ExecutionTime { get; set; }
    public virtual Guide Guide { get; set; } = null!;
    public virtual Kit? Kit { get; set; }
    public virtual User Manager { get; set; } = null!;
    public virtual Part Part { get; set; } = null!;
    public virtual Product? Product { get; set; }
    public virtual User? Technician { get; set; }
    public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();
    public virtual ICollection<ScrapRequest> ScrapRequests { get; set; } = new List<ScrapRequest>();
    public virtual ICollection<VendorReturnRequest> VendorReturnRequests { get; set; } = new List<VendorReturnRequest>();
    public virtual ICollection<WorkOrderStep> WorkOrderSteps { get; set; } = new List<WorkOrderStep>();
    public virtual ICollection<WorkOrderTask> WorkOrderTasks { get; set; } = new List<WorkOrderTask>();
    public virtual WorkPackage? WorkPackage { get; set; }
}
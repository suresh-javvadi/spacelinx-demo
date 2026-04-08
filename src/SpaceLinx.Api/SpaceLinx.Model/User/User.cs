namespace SpaceLinx.Model;

public partial class User : BaseModel
{
    public int UserNumber { get; set; }
    public string FirstName { get; set; } = null!;
    public string? LastName { get; set; }
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? ImageUrl { get; set; }
    public string? Department { get; set; }
    public string? JobTitle { get; set; }
    public virtual ICollection<ApprovalNotificationRecipient> ApprovalNotificationRecipients { get; set; } = new List<ApprovalNotificationRecipient>();
    public virtual ICollection<Approval> Approvals { get; set; } = new List<Approval>();
    public virtual ICollection<GoodsReceiptNote> GoodsReceiptNotes { get; set; } = new List<GoodsReceiptNote>();
    public virtual ICollection<GrnLineItem> GrnLineItems { get; set; } = new List<GrnLineItem>();
    public virtual ICollection<InventoryStock> InventoryStocks { get; set; } = new List<InventoryStock>();
    public virtual ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
    public virtual ICollection<Program> ProgramBuyers { get; set; } = new List<Program>();
    public virtual ICollection<Program> ProgramProgramManagers { get; set; } = new List<Program>();
    public virtual ICollection<Program> ProgramSupplyChainManagers { get; set; } = new List<Program>();
    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
    public virtual ICollection<PurchaseOrder> PurchaseOrderBuyers { get; set; } = new List<PurchaseOrder>();
    public virtual ICollection<PurchaseOrder> PurchaseOrderSupplyChainLeads { get; set; } = new List<PurchaseOrder>();
    public virtual ICollection<Requisition> Requisitions { get; set; } = new List<Requisition>();
    public virtual ICollection<ResourceAllocation> ResourceAllocations { get; set; } = new List<ResourceAllocation>();
    public virtual ICollection<ScrapRequest> ScrapRequests { get; set; } = new List<ScrapRequest>();
    public virtual ICollection<Staff> Staff { get; set; } = new List<Staff>();
    public virtual ICollection<StockMovement> StockMovementAssignedUsers { get; set; } = new List<StockMovement>();
    public virtual ICollection<StockMovement> StockMovementPerformedBies { get; set; } = new List<StockMovement>();
    public virtual ICollection<TaskAssignee> TaskAssignees { get; set; } = new List<TaskAssignee>();
    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
    public virtual ICollection<Tender> Tenders { get; set; } = new List<Tender>();
    public virtual ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<VendorReturnRequest> VendorReturnRequests { get; set; } = new List<VendorReturnRequest>();
}

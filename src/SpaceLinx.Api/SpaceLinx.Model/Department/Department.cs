namespace SpaceLinx.Model
{
    public partial class Department : BaseModel
    {
    // UAT: created_at / is_active are NULLABLE on this table. BaseModel declares them non-nullable;
    // shadow as nullable so the EF column matches UAT exactly. DB defaults (CURRENT_TIMESTAMP / true)
    // populate them on insert; the generic controller deactivate/remove writes IsActive via the EF entry.
    public new DateTime? CreatedAt { get; set; }
    public new bool? IsActive { get; set; }

        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public Guid? ParentDepartmentId { get; set; }
        public Guid? HeadOfDepartmentUserId { get; set; }

        public virtual Department? ParentDepartment { get; set; }
        public virtual ICollection<Department> ChildDepartments { get; set; } = new List<Department>();
        public virtual User? HeadOfDepartmentUser { get; set; }

        public virtual ICollection<User> Users { get; set; } = new List<User>();
        public virtual ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
        public virtual ICollection<Requisition> Requisitions { get; set; } = new List<Requisition>();
    }
}

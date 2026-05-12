namespace SpaceLinx.Model
{
    public partial class Department : BaseModel
    {
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

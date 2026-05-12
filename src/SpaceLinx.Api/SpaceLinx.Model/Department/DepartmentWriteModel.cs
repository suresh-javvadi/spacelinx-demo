namespace SpaceLinx.Model
{
    public partial class DepartmentWriteModel : BaseWriteModel
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public Guid? ParentDepartmentId { get; set; }
        public Guid? HeadOfDepartmentUserId { get; set; }
    }
}

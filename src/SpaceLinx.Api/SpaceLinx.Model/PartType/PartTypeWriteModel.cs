namespace SpaceLinx.Model
{
    public partial class PartTypeWriteModel : BaseWriteModel
    {
        public string Name { get; set; } = null!;
        public string? PartNumberPrefix { get; set; }
        public string? Category { get; set; }
        public string? CategoryType { get; set; }
        public bool IsVisibleInUi { get; set; }
        public string? Department { get; set; }
        public Guid? PartTypeCategoryId { get; set; }
        public Guid? PartLevelId { get; set; }
    }
}
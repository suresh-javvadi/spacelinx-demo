namespace SpaceLinx.Model
{
    public partial class ProjectUpdateModel : BaseUpdateModel
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public Guid? ProgramId { get; set; }
        public Guid? ProjectManagerId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Status { get; set; }
        public decimal? Budget { get; set; }
    }
}

namespace SpaceLinx.Model
{
    public partial class SubProjectRefModel : BaseRefModel
    {
        public string SubProjectCode { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public Guid ProjectId { get; set; }
        public Guid? ProgramId { get; set; }
        public Guid? ProjectManagerId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Status { get; set; }
        public decimal? Budget { get; set; }
    }
}

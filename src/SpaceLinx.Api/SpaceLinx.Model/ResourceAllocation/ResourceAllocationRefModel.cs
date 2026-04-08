namespace SpaceLinx.Model
{
    public class ResourceAllocationRefModel : BaseRefModel
    {
        public Guid UserId { get; set; }
        public Guid ProjectId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int AllocationPercent { get; set; }
        public string AllocationType { get; set; } = null!;
    }
}

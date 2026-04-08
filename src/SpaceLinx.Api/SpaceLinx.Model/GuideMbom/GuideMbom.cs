namespace SpaceLinx.Model
{ 
   public partial class GuideMbom : BaseModel
   {
        public Guid GuideId { get; set; }
        public Guid PartId { get; set; }
        public int Quantity { get; set; }
        public double Weight { get; set; }
        public virtual Guide Guide { get; set; } = null!;
        public virtual Part Part { get; set; } = null!;
   }
}
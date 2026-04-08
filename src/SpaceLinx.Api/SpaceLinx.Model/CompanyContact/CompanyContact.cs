namespace SpaceLinx.Model
{
    public partial class CompanyContact : BaseModel
    {
        public Guid CompanyId { get; set; }
        public Guid ContactId { get; set; }
        public string ContactType { get; set; } = null!;
        public virtual Contact Contact { get; set; } = null!;
        public virtual Company Company { get; set; } = null!;
    }
}
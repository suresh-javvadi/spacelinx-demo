namespace SpaceLinx.Model
{
    public partial class CompanyContactReadModel : BaseReadModel
    {
        public Guid CompanyId { get; set; }
        public Guid ContactId { get; set; }
        public string ContactType { get; set; } = null!;
        public virtual ContactRefModel Contact { get; set; } = null!;
        public virtual CompanyRefModel Company { get; set; } = null!;
    }
}
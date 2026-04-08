namespace SpaceLinx.Model
{
    public partial class CompanyContactUpdateModel : BaseUpdateModel
    {
        public Guid CompanyId { get; set; }
        public Guid ContactId { get; set; }
        public string ContactType { get; set; } = null!;
    }
}
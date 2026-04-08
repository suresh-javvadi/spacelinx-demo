namespace SpaceLinx.Model
{
    public partial class CompanyContactWriteModel : BaseWriteModel
    {
        public Guid CompanyId { get; set; }
        public Guid ContactId { get; set; }
        public string ContactType { get; set; } = null!;
    }
}
namespace SpaceLinx.Model
{
    public partial class NewsUpdateModel : BaseUpdateModel
    {
        public string Title { get; set; } = null!;
        public Guid NewsTypeId { get; set; }
        public string Hyperlink { get; set; } = null!;
        public string Origin { get; set; } = null!;
        public string Image { get; set; } = null!;
    }
}

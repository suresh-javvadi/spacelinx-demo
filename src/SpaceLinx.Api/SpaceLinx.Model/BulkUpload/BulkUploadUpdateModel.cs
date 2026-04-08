namespace SpaceLinx.Model
{
    public partial class BulkUploadUpdateModel : BaseUpdateModel
    {
        public string ApplicationName { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public string FilePath { get; set; } = null!;
    }
}

namespace SpaceLinx.Model
{
    public partial class BulkUploadWriteModel : BaseWriteModel
    {
        public string ApplicationName { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public string FilePath { get; set; } = null!;
        public string RequestedBy { get; set; } = null!;
        public DateTime RequestedAt { get; set; }
        public string Type { get; set; } = null!;
        public string? Error { get; set; }
        public string Status { get; set; } = null!;
    }
}

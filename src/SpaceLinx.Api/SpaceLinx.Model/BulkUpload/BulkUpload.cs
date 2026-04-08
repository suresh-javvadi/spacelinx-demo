namespace SpaceLinx.Model
{
    public partial class BulkUpload : BaseModel
    {
        public string ApplicationName { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public string FilePath { get; set; } = null!;
        public string RequestedBy { get; set; } = null!;
        public DateTime RequestedAt { get; set; }
        public string Type { get; set; } = null!;
        public string? Error { get; set; }
        public string Status { get; set; } = null!;
        public int? TotalCount { get; set; }
        public int? SuccessCount { get; set; }
        public int? FailedCount { get; set; }
        public string? Url { get; set; }
    }
}
namespace SpaceLinx.Model
{
    public partial class Workorderguidestepsview
    {
        public Guid? Workorderid { get; set; }
        public int? Guidestepsequence { get; set; }
        public string? Guidestepname { get; set; }
        public long? Numberofworkordertasks { get; set; }
        public long? Numberofguidesteptasks { get; set; }
        public TimeSpan? Capturedtime { get; set; }
        public string? Workorderstepstatus { get; set; }
    }
}

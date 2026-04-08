namespace SpaceLinx.Model
{
    public partial class KitSerialAndCommentsWriteModel
    {
        public string? Comments { get; set; }
        public List<KitSerialWriteModel> SerialNumbers { get; set; } = new List<KitSerialWriteModel>();
    }
}

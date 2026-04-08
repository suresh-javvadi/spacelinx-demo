namespace SpaceLinx.Model
{
    public partial class InventoryTransactionRefModel : BaseRefModel
    {
        public Guid PartId { get; set; }
        public string TransactionType { get; set; } = null!;
        public int? CurrentQuantity { get; set; }
        public int? PreviousQuantity { get; set; }
        public int TransactedQuantity { get; set; }
        public string? ReferenceType { get; set; }
        public Guid? ReferenceId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? Notes { get; set; }
        public Guid? FromLocationId { get; set; }
        public Guid? ToLocationId { get; set; }
        public Guid? ProjectId { get; set; }
        public string? Department { get; set; }
        public Guid? AssignedUserId { get; set; }
    }
}
namespace SpaceLinx.Model
{
    public partial class InventoryTransactionVw
    {
        public Guid? Id { get; set; }
        public Guid? PartId { get; set; }
        public string? PartNumber { get; set; }
        public string? PartName { get; set; }
        public Guid? PartTypeId { get; set; }
        public string? PartStatus { get; set; }
        public string? ItemType { get; set; }
        public string? TransactionType { get; set; }
        public int? CurrentQuantity { get; set; }
        public int? PreviousQuantity { get; set; }
        public int? TransactedQuantity { get; set; }
        public string? ReferenceType { get; set; }
        public Guid? ReferenceId { get; set; }
        public string? ReferenceNumber { get; set; }
        public DateTime? TransactionDate { get; set; }
        public string? Notes { get; set; }
        public Guid? FromLocationId { get; set; }
        public string? FromLocationName { get; set; }
        public string? FromLocationNumber { get; set; }
        public Guid? ToLocationId { get; set; }
        public string? ToLocationName { get; set; }
        public string? ToLocationNumber { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? CreatedByFullName { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
    }
}
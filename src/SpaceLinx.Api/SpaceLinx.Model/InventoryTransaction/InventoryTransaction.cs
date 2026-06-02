namespace SpaceLinx.Model
{
    // Immutable inventory ledger — append-only by design; updates are not field-audited.
    [AuditExclude(AuditOperations.Update)]
    public partial class InventoryTransaction : BaseModel
    {
        public Guid PartId { get; set; }
        public Guid? FromLocationId { get; set; }
        public string TransactionType { get; set; } = null!;
        public int? CurrentQuantity { get; set; }
        public int? PreviousQuantity { get; set; }
        public int TransactedQuantity { get; set; }
        public string? ReferenceType { get; set; }
        public Guid? ReferenceId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? Notes { get; set; }
        public Guid? ToLocationId { get; set; }
        public string? TrackingType { get; set; }
        public string? TrackingId { get; set; }
        public Guid? ProjectId { get; set; }
        public string? Department { get; set; }
        public Guid? AssignedUserId { get; set; }
        public virtual Location? FromLocation { get; set; }
        public virtual Part Part { get; set; } = null!;
        public virtual Location? ToLocation { get; set; }
        public virtual Project? Project { get; set; }
        public virtual User? AssignedUser { get; set; }
    }
}

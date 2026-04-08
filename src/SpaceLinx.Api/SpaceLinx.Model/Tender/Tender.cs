namespace SpaceLinx.Model;

public partial class Tender : BaseModel
{
    public string TenderNumber { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string Status { get; set; } = null!;
    public Guid? RequisitionId { get; set; }
    public Guid? ProjectId { get; set; }
    public DateOnly? PublishDate { get; set; }
    public DateOnly ClosingDate { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public Guid? AwardedVendorId { get; set; }
    public DateTime? AwardedDate { get; set; }
    public string? AwardedBy { get; set; }
    public Guid? BuyerId { get; set; }
    public string? Terms { get; set; }
    public Guid? PaymentTermId { get; set; }
    public Guid? CurrencyId { get; set; }
    public string? RejectedBy { get; set; }
    public DateTime? RejectedDate { get; set; }
    public string? ApproverComment { get; set; }

    // Navigation properties
    public virtual Requisition? Requisition { get; set; }
    public virtual Project? Project { get; set; }
    public virtual Company? AwardedVendor { get; set; }
    public virtual User? Buyer { get; set; }
    public virtual PaymentTerm? PaymentTerm { get; set; }
    public virtual Currency? Currency { get; set; }
    public virtual ICollection<TenderLineItem> TenderLineItems { get; set; } = new List<TenderLineItem>();
    public virtual ICollection<TenderVendor> TenderVendors { get; set; } = new List<TenderVendor>();
    public virtual ICollection<TenderQuotation> TenderQuotations { get; set; } = new List<TenderQuotation>();
}

namespace SpaceLinx.Model;

public partial class TenderReadModel : BaseReadModel
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

    // Reference models
    public virtual RequisitionRefModel? Requisition { get; set; }
    public virtual ProjectRefModel? Project { get; set; }
    public virtual CompanyRefModel? AwardedVendor { get; set; }
    public virtual UserRefModel? Buyer { get; set; }
    public virtual PaymentTermRefModel? PaymentTerm { get; set; }
    public virtual CurrencyRefModel? Currency { get; set; }
}

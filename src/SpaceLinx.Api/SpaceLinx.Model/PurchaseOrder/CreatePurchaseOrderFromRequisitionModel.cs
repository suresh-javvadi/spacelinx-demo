using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model;

public class CreatePurchaseOrderFromRequisitionModel
{
    [Required]
    public Guid CompanyId { get; set; }

    public Guid? BillingAddressId { get; set; }
    public Guid? DeliveryAddressId { get; set; }
    public Guid? ShippingAddressId { get; set; }
    public Guid? VendorBillingAddressId { get; set; }
    public Guid? VendorBillingContactId { get; set; }
    public Guid? BuyerId { get; set; }
    public Guid? SupplyChainLeadId { get; set; }
    public Guid? PaymentTermId { get; set; }
    public Guid? CurrencyId { get; set; }
    public DateOnly? ExpectedDeliveryDate { get; set; }
    public string? TaxOption { get; set; }
    public string? PoTerms { get; set; }
    public string? Description { get; set; }
    public string? CustomerInstructions { get; set; }
    public string? DeliveryTerms { get; set; }
    public string? TermsAndConditions { get; set; }
    public string? PoType { get; set; }
    public List<LineItemPricingModel>? LineItemPricing { get; set; }
}

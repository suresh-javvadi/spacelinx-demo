namespace SpaceLinx.Model;

/// <summary>
/// Model representing a row in the Zoho Books Purchase Order CSV export.
/// Each row represents a line item with PO header information repeated.
/// </summary>
public class ZohoPurchaseOrderExportModel
{
    // PO Header Fields
    public string PurchaseOrderDate { get; set; } = string.Empty;
    public string ExpectedDeliveryDate { get; set; } = string.Empty;
    public string PurchaseOrderNumber { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public string PurchaseOrderStatus { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public string CurrencyCode { get; set; } = string.Empty;
    public string SourceOfSupply { get; set; } = string.Empty;
    public string DestinationOfSupply { get; set; } = string.Empty;
    public string GstTreatment { get; set; } = string.Empty;
    public string Gstin { get; set; } = string.Empty;
    public string ExchangeRate { get; set; } = "1";
    public string TemplateName { get; set; } = "Standard Template";
    public string ReferenceNo { get; set; } = string.Empty;
    public string DeliveryInstructions { get; set; } = string.Empty;
    public string TermsAndConditions { get; set; } = string.Empty;

    // Item Level Fields
    public string ItemType { get; set; } = "goods";
    public string DiscountType { get; set; } = string.Empty;
    public string DiscountAmount { get; set; } = string.Empty;
    public string IsDiscountBeforeTax { get; set; } = "FALSE";
    public string EntityDiscountPercent { get; set; } = "0";
    public string EntityDiscountAmount { get; set; } = "0";
    public string DiscountAccount { get; set; } = string.Empty;
    public string Account { get; set; } = string.Empty;
    public string ItemPrice { get; set; } = string.Empty;
    public string IsInclusiveTax { get; set; } = "FALSE";
    public string ItemName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string ItemDesc { get; set; } = string.Empty;
    public string Quantity { get; set; } = string.Empty;
    public string UsageUnit { get; set; } = string.Empty;
    public string ItemTax { get; set; } = string.Empty;
    public string ItemTaxType { get; set; } = string.Empty;
    public string ItemTaxPercent { get; set; } = string.Empty;
    public string ItemExemptionCode { get; set; } = string.Empty;
    public string ReverseChargeTaxName { get; set; } = string.Empty;
    public string ReverseChargeTaxRate { get; set; } = string.Empty;
    public string ReverseChargeTaxType { get; set; } = string.Empty;
    public string Attention { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public string Adjustment { get; set; } = "0";
    public string AdjustmentDescription { get; set; } = string.Empty;
    public string PaymentTerms { get; set; } = string.Empty;
    public string PaymentTermsLabel { get; set; } = string.Empty;
    public string DeliverToCustomer { get; set; } = string.Empty;
    public string BranchName { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public string HsnSac { get; set; } = string.Empty;
    public string SupplyType { get; set; } = string.Empty;

    /// <summary>
    /// Returns the CSV header row matching Zoho Books format
    /// </summary>
    public static string GetCsvHeader()
    {
        return "Purchase Order Date,Expected Delivery Date,Purchase Order Number,Reference#,Purchase Order Status,Vendor Name,Currency Code,Source of Supply,Destination of Supply,GST Treatment,GST Identification Number (GSTIN),Exchange Rate,Template Name,Reference No,Delivery Instructions,Terms & Conditions,Item Type,Discount Type,Discount Amount,Is Discount Before Tax,Entity Discount Percent,Entity Discount Amount,Discount Account,Account,Item Price,Is Inclusive Tax,Item Name,SKU,Item Desc,Quantity,Usage unit,Item Tax,Item Tax Type,Item Tax %,Item Exemption Code,Reverse Charge Tax Name,Reverse Charge Tax Rate,Reverse Charge Tax Type,Attention,Project Name,Adjustment,Adjustment Description,Payment Terms,Payment Terms Label,Deliver To Customer,Branch Name,Warehouse Name,HSN/SAC,Supply Type";
    }

    /// <summary>
    /// Converts this model to a CSV row
    /// </summary>
    public string ToCsvRow()
    {
        var fields = new[]
        {
            EscapeCsvField(PurchaseOrderDate),
            EscapeCsvField(ExpectedDeliveryDate),
            EscapeCsvField(PurchaseOrderNumber),
            EscapeCsvField(Reference),
            EscapeCsvField(PurchaseOrderStatus),
            EscapeCsvField(VendorName),
            EscapeCsvField(CurrencyCode),
            EscapeCsvField(SourceOfSupply),
            EscapeCsvField(DestinationOfSupply),
            EscapeCsvField(GstTreatment),
            EscapeCsvField(Gstin),
            EscapeCsvField(ExchangeRate),
            EscapeCsvField(TemplateName),
            EscapeCsvField(ReferenceNo),
            EscapeCsvField(DeliveryInstructions),
            EscapeCsvField(TermsAndConditions),
            EscapeCsvField(ItemType),
            EscapeCsvField(DiscountType),
            EscapeCsvField(DiscountAmount),
            EscapeCsvField(IsDiscountBeforeTax),
            EscapeCsvField(EntityDiscountPercent),
            EscapeCsvField(EntityDiscountAmount),
            EscapeCsvField(DiscountAccount),
            EscapeCsvField(Account),
            EscapeCsvField(ItemPrice),
            EscapeCsvField(IsInclusiveTax),
            EscapeCsvField(ItemName),
            EscapeCsvField(Sku),
            EscapeCsvField(ItemDesc),
            EscapeCsvField(Quantity),
            EscapeCsvField(UsageUnit),
            EscapeCsvField(ItemTax),
            EscapeCsvField(ItemTaxType),
            EscapeCsvField(ItemTaxPercent),
            EscapeCsvField(ItemExemptionCode),
            EscapeCsvField(ReverseChargeTaxName),
            EscapeCsvField(ReverseChargeTaxRate),
            EscapeCsvField(ReverseChargeTaxType),
            EscapeCsvField(Attention),
            EscapeCsvField(ProjectName),
            EscapeCsvField(Adjustment),
            EscapeCsvField(AdjustmentDescription),
            EscapeCsvField(PaymentTerms),
            EscapeCsvField(PaymentTermsLabel),
            EscapeCsvField(DeliverToCustomer),
            EscapeCsvField(BranchName),
            EscapeCsvField(WarehouseName),
            EscapeCsvField(HsnSac),
            EscapeCsvField(SupplyType)
        };

        return string.Join(",", fields);
    }

    private static string EscapeCsvField(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return string.Empty;

        // If the field contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        return value;
    }
}

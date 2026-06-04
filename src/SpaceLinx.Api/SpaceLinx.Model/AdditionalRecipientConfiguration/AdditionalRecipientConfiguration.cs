namespace SpaceLinx.Model;

public partial class AdditionalRecipientConfiguration : BaseModel
{
    // UAT: created_at / is_active are NULLABLE on this table. BaseModel declares them non-nullable;
    // shadow as nullable so the EF column matches UAT exactly. DB defaults (CURRENT_TIMESTAMP / true)
    // populate them on insert; the generic controller deactivate/remove writes IsActive via the EF entry.
    public new DateTime? CreatedAt { get; set; }
    public new bool? IsActive { get; set; }

    public string TemplateCode { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? RecipientName { get; set; }
    public string? RecipientType { get; set; }
}

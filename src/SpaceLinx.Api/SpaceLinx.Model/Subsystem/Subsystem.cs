namespace SpaceLinx.Model;

public partial class Subsystem : BaseModel
{
    // UAT: created_at / is_active are NULLABLE on this table. BaseModel declares them non-nullable;
    // shadow as nullable so the EF column matches UAT exactly. DB defaults (CURRENT_TIMESTAMP / true)
    // populate them on insert; the generic controller deactivate/remove writes IsActive via the EF entry.
    public new DateTime? CreatedAt { get; set; }
    public new bool? IsActive { get; set; }

    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public virtual ICollection<Part> Parts { get; set; } = new List<Part>();
}

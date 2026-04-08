using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model;

public partial class PartLevelUpdateModel : BaseUpdateModel
{
    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = null!;

    [MaxLength(500)]
    public string? Description { get; set; }

    public int? SortOrder { get; set; }
}

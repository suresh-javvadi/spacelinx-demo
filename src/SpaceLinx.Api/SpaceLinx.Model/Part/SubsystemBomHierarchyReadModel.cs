namespace SpaceLinx.Model;

/// <summary>
/// Represents a BOM hierarchy view organized by subsystem.
/// Each subsystem contains parts belonging to it with their hierarchical structure.
/// </summary>
public class SubsystemBomHierarchyReadModel
{
    /// <summary>
    /// The subsystem ID. Null for parts without a subsystem assignment.
    /// </summary>
    public Guid? SubsystemId { get; set; }

    /// <summary>
    /// The subsystem code. "Unassigned" for parts without a subsystem.
    /// </summary>
    public string SubsystemCode { get; set; } = null!;

    /// <summary>
    /// The subsystem name. "Unassigned Parts" for parts without a subsystem.
    /// </summary>
    public string SubsystemName { get; set; } = null!;

    /// <summary>
    /// Parts belonging to this subsystem with their hierarchical BOM structure.
    /// </summary>
    public List<PartDetailReadModel> Parts { get; set; } = new();
}

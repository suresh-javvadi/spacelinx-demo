namespace SpaceLinx.Model;

/// <summary>
/// Represents a BOM hierarchy view organized by assembly location, then by subsystem.
/// Each location contains subsystems, and each subsystem contains parts belonging to it with their hierarchical structure.
/// </summary>
public class LocationBomHierarchyReadModel
{
    /// <summary>
    /// The assembly location ID. Null for parts without an assembly location assignment.
    /// </summary>
    public Guid? LocationId { get; set; }

    /// <summary>
    /// The assembly location name. "Unassigned" for parts without an assembly location.
    /// </summary>
    public string LocationName { get; set; } = null!;

    /// <summary>
    /// Subsystems under this location, each containing their parts with hierarchical BOM structure.
    /// </summary>
    public List<SubsystemBomHierarchyReadModel> Subsystems { get; set; } = new();
}

using SpaceLinx.Model;

namespace SpaceLinx.Api.Interfaces;

public interface IPartService
{
    Task<Part?> ClonePartWithNewVersion(Guid partId);
    bool IsPartEditable(Guid partId);
    bool IsPartEditable(string status);
}

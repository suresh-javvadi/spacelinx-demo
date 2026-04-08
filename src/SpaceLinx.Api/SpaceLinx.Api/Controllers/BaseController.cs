using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Model;
using System.ComponentModel;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BaseController(SpaceLinxContext _spaceLinxContext, IHttpContextAccessor _httpContextAccessor) : ControllerBase, IDisposable
{
    [FromHeader(Name = "roleId")]
    public Guid? RoleId { get; set; }

    [FromHeader(Name = SpaceLinxConstants.SpaceLinxAppHeaderKey)]
    [DefaultValue("SPACELINX")]
    public required string AppName { get; set; }

    public string UserEmail
        => GetUserEmail()
        ?? string.Empty;

    private bool disposed = true;

    [ApiExplorerSettings(IgnoreApi = true)]
    [NonAction]
    public void Dispose(bool disposing)
    {
        if(!this.disposed)
        {
            if (disposing)
            {
                try
                {
                    _spaceLinxContext?.Dispose();
                }
                catch (Exception)
                {
                }
            }
        }

        this.disposed = true;
    }

    [ApiExplorerSettings(IgnoreApi = true)]
    [NonAction]
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    private string? GetUserEmail()
    {
        string? emailId = _httpContextAccessor.HttpContext?.User?.Identity?.Name;
        emailId ??= _httpContextAccessor.HttpContext?.User?.Claims?.
            FirstOrDefault(x => x.Type == "preferred_username")?.Value;
        emailId = emailId?.ToLower();
        return emailId;
    }
}

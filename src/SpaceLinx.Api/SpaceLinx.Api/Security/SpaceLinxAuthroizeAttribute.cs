using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Caching.Distributed;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using System.Net.Mail;
using System.Text.Json;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Security;

public class SpaceLinxAuthroizeAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        string? emailId = GetUserEmail(context);
        if (string.IsNullOrEmpty(emailId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        if (!MailAddress.TryCreate(emailId, out var email))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        bool isUserExist = await CheckUser(context, emailId);
        if (!isUserExist)
        {
            context.Result = new UnauthorizedResult();
        }
    }

    private static string? GetUserEmail(AuthorizationFilterContext context)
    {
        string? emailId = context.HttpContext.User.Identity?.Name; //Azure version 1
        emailId ??= context.HttpContext.User.Claims?.FirstOrDefault(x => (x.Type == SpaceLinxConstants.PrefUserName || //Azure version 2
        x.Type == SpaceLinxConstants.EmailClaim))?.Value; //Google 
        emailId = emailId?.ToLower();
        return emailId;
    }

    private static async Task<bool> CheckUser(AuthorizationFilterContext context, string email)
    {
        var distributedCache = context.HttpContext.RequestServices.GetService<IDistributedCache>();
        if (distributedCache == null)
        {
            context.Result = new UnauthorizedResult();
            return false;
        }

        var key = $"{email}-SpaceLinx";
        var userData = await distributedCache.GetStringAsync(key);
        if (!string.IsNullOrEmpty(userData))
        {
            return true;
        }

        var userService = context.HttpContext.RequestServices.GetService<IUserService>();
        if (userService == null)
        {
            context.Result = new UnauthorizedResult();
            return false;
        }

        var user = await userService.GetUserDetailsAsync();
        if (user == null)
        {
            return false;
        }

        await SetUserDetailsInCache(distributedCache, email, user);

        return true;
    }

    private static async Task SetUserDetailsInCache(IDistributedCache distributedCache, string email, User userDetails)
    {
        var key = $"{email}-SpaceLinx";
        var value = email; // JsonSerializer.Serialize(userDetails);
        await distributedCache.SetStringAsync(key, value, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(1)
        });
    }
}

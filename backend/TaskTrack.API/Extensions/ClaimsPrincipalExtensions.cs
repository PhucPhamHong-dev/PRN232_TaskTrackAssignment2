using System.Security.Claims;
using TaskTrack.Service.Exceptions;

namespace TaskTrack.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetAccountId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue("AccountID") ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var accountId)
            ? accountId
            : throw new ServiceException("The access token does not contain a valid AccountID.", 401);
    }
}

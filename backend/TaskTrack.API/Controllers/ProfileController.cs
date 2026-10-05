using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrack.API.Extensions;
using TaskTrack.Service.Dtos;
using TaskTrack.Service.Interfaces;

namespace TaskTrack.API.Controllers;

[ApiController, Authorize, Route("api/profile")]
public class ProfileController(IAccountService service) : ControllerBase
{
    [HttpGet] public async Task<ActionResult> Get() => Ok(await service.GetProfileAsync(User.GetAccountId()));
    [HttpPut] public async Task<ActionResult> Update(UpdateProfileRequest request) =>
        Ok(await service.UpdateProfileAsync(User.GetAccountId(), request));

    [HttpPut("password")]
    public async Task<ActionResult> ChangePassword(ChangePasswordRequest request)
    {
        await service.ChangePasswordAsync(User.GetAccountId(), request);
        return NoContent();
    }
}

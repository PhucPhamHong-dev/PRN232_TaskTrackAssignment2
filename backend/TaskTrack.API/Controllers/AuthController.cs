using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrack.Service.Dtos;
using TaskTrack.Service.Interfaces;

namespace TaskTrack.API.Controllers;

[ApiController, Route("api/auth")]
public class AuthController(IAuthService service) : ControllerBase
{
    [AllowAnonymous, HttpPost("register")]
    public async Task<ActionResult<AccountDto>> Register(RegisterRequest request) =>
        StatusCode(StatusCodes.Status201Created, await service.RegisterAsync(request));

    [AllowAnonymous, HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request) =>
        Ok(await service.LoginAsync(request));

    [AllowAnonymous, HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshRequest request) =>
        Ok(await service.RefreshAsync(request));

    [AllowAnonymous, HttpPost("logout")]
    public async Task<ActionResult> Logout(LogoutRequest request)
    {
        await service.LogoutAsync(request);
        return NoContent();
    }
}

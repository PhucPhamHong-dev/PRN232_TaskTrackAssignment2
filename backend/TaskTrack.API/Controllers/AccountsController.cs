using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrack.API.Extensions;
using TaskTrack.Service.Dtos;
using TaskTrack.Service.Interfaces;

namespace TaskTrack.API.Controllers;

[ApiController, Authorize(Roles = "Admin"), Route("api/accounts")]
public class AccountsController(IAccountService service) : ControllerBase
{
    [HttpGet] public async Task<ActionResult> GetAll() => Ok(await service.GetAllAsync());
    [HttpGet("{id:int}")] public async Task<ActionResult> GetById(int id) => Ok(await service.GetByIdAsync(id));
    [HttpPut("{id:int}")] public async Task<ActionResult> Update(int id, UpdateAccountRequest request) =>
        Ok(await service.UpdateAsync(id, User.GetAccountId(), request));

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        await service.DeleteAsync(id, User.GetAccountId());
        return NoContent();
    }
}

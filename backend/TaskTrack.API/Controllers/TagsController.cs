using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrack.Service.Dtos;
using TaskTrack.Service.Interfaces;

namespace TaskTrack.API.Controllers;

[ApiController, Route("api/tags")]
public class TagsController(ITagService service) : ControllerBase
{
    [HttpGet] public async Task<ActionResult> GetAll() => Ok(await service.GetAllAsync());
    [Authorize, HttpPost] public async Task<ActionResult> Create(TagRequest request) { var created = await service.CreateAsync(request); return StatusCode(StatusCodes.Status201Created, created); }
    [Authorize, HttpPut("{id:int}")] public async Task<ActionResult> Update(int id, TagRequest request) => Ok(await service.UpdateAsync(id, request));
    [Authorize, HttpDelete("{id:int}")] public async Task<ActionResult> Delete(int id) { await service.DeleteAsync(id); return NoContent(); }
}

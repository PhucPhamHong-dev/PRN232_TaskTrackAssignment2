using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrack.Service.Dtos;
using TaskTrack.Service.Interfaces;

namespace TaskTrack.API.Controllers;

[ApiController, Route("api/departments")]
public class DepartmentsController(IDepartmentService service) : ControllerBase
{
    [HttpGet] public async Task<ActionResult> GetAll() => Ok(await service.GetAllAsync());
    [HttpGet("search")] public async Task<ActionResult> Search([FromQuery] string? name) => Ok(await service.GetAllAsync(name));
    [HttpGet("{id:int}")] public async Task<ActionResult> GetById(int id) => Ok(await service.GetByIdAsync(id));
    [Authorize, HttpPost] public async Task<ActionResult> Create(DepartmentRequest request) { var created = await service.CreateAsync(request); return CreatedAtAction(nameof(GetById), new { id = created.DepartmentId }, created); }
    [Authorize, HttpPut("{id:int}")] public async Task<ActionResult> Update(int id, DepartmentRequest request) => Ok(await service.UpdateAsync(id, request));
    [Authorize, HttpDelete("{id:int}")] public async Task<ActionResult> Delete(int id) { await service.DeleteAsync(id); return NoContent(); }
}

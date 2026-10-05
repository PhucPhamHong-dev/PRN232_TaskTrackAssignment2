using TaskTrack.Service.Dtos;

namespace TaskTrack.Service.Interfaces;

public interface ITaskService
{
    Task<IReadOnlyList<TaskDto>> GetAllAsync(string? title = null, short? status = null, short? priority = null, int? projectId = null, int? tagId = null);
    Task<TaskDto> GetByIdAsync(int id);
    Task<IReadOnlyList<TaskDto>> GetByProjectAsync(int projectId);
    Task<TaskDto> CreateAsync(TaskRequest request, int accountId);
    Task<TaskDto> UpdateAsync(int id, TaskRequest request, int accountId);
    Task DeleteAsync(int id, int accountId);
}

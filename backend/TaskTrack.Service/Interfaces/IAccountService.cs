using TaskTrack.Service.Dtos;

namespace TaskTrack.Service.Interfaces;

public interface IAccountService
{
    Task<IReadOnlyList<AccountDto>> GetAllAsync();
    Task<AccountDto> GetByIdAsync(int id);
    Task<AccountDto> UpdateAsync(int id, int actingAccountId, UpdateAccountRequest request);
    Task DeleteAsync(int id, int actingAccountId);
    Task<AccountDto> GetProfileAsync(int accountId);
    Task<AccountDto> UpdateProfileAsync(int accountId, UpdateProfileRequest request);
    Task ChangePasswordAsync(int accountId, ChangePasswordRequest request);
}

using TaskTrack.Repo.Repositories;
using TaskTrack.Service.Dtos;
using TaskTrack.Service.Exceptions;
using TaskTrack.Service.Interfaces;

namespace TaskTrack.Service.Services;

public class AccountService(IAccountRepository repository, IPasswordHasher passwordHasher) : IAccountService
{
    public async Task<IReadOnlyList<AccountDto>> GetAllAsync() =>
        (await repository.GetAllAsync()).Select(AuthService.MapAccount).ToList();

    public async Task<AccountDto> GetByIdAsync(int id) =>
        AuthService.MapAccount(await FindAccountAsync(id));

    public async Task<AccountDto> UpdateAsync(int id, int actingAccountId, UpdateAccountRequest request)
    {
        var account = await FindAccountAsync(id);
        if (id == actingAccountId && request.Role != account.Role)
            throw new ServiceException("You cannot change your own administrator role.", 409);

        var roleChanged = account.Role != request.Role;
        account.FullName = request.FullName.Trim();
        account.Role = request.Role;
        if (roleChanged) await repository.RevokeAllRefreshTokensAsync(id, DatabaseNow());
        await repository.SaveChangesAsync();
        return AuthService.MapAccount(account);
    }

    public async Task DeleteAsync(int id, int actingAccountId)
    {
        if (id == actingAccountId) throw new ServiceException("You cannot delete your own account.", 409);
        var account = await FindAccountAsync(id);
        if (await repository.HasCreatedTasksAsync(id))
            throw new ServiceException("This account cannot be deleted because it has created tasks.", 409);
        repository.Delete(account);
        await repository.SaveChangesAsync();
    }

    public Task<AccountDto> GetProfileAsync(int accountId) => GetByIdAsync(accountId);

    public async Task<AccountDto> UpdateProfileAsync(int accountId, UpdateProfileRequest request)
    {
        var account = await FindAccountAsync(accountId);
        account.FullName = request.FullName.Trim();
        await repository.SaveChangesAsync();
        return AuthService.MapAccount(account);
    }

    public async Task ChangePasswordAsync(int accountId, ChangePasswordRequest request)
    {
        var account = await FindAccountAsync(accountId);
        if (!passwordHasher.Verify(request.CurrentPassword, account.PasswordHash))
            throw new ServiceException("Current password is incorrect.", 400);
        account.PasswordHash = passwordHasher.Hash(request.NewPassword);
        await repository.RevokeAllRefreshTokensAsync(accountId, DatabaseNow());
        await repository.SaveChangesAsync();
    }

    private async Task<TaskTrack.Repo.Models.SystemAccount> FindAccountAsync(int id) =>
        await repository.GetByIdAsync(id) ?? throw new ServiceException("Account not found.", 404);

    private static DateTime DatabaseNow() => DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
}

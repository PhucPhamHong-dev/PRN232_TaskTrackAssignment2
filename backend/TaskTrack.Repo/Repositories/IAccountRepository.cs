using System;
using System.Threading.Tasks;
using RefreshToken = TaskTrack.Repo.Models.RefreshToken;
using SystemAccount = TaskTrack.Repo.Models.SystemAccount;

namespace TaskTrack.Repo.Repositories;

public interface IAccountRepository
{
    Task<SystemAccount?> GetByEmailAsync(string normalizedEmail);
    Task<SystemAccount?> GetByIdAsync(int id);
    Task<bool> EmailExistsAsync(string normalizedEmail, int? exceptAccountId = null);
    Task AddAsync(SystemAccount account);
    void Delete(SystemAccount account);
    Task<bool> HasCreatedTasksAsync(int accountId);

    Task<RefreshToken?> GetRefreshTokenAsync(string tokenHash);
    Task AddRefreshTokenAsync(RefreshToken token);
    Task RevokeAllRefreshTokensAsync(int accountId, DateTime revokedDate);

    Task<int> SaveChangesAsync();
}

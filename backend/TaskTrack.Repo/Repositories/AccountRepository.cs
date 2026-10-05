using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RefreshToken = TaskTrack.Repo.Models.RefreshToken;
using SystemAccount = TaskTrack.Repo.Models.SystemAccount;

namespace TaskTrack.Repo.Repositories;

public class AccountRepository(TaskManagementContext db) : IAccountRepository
{
    public Task<List<SystemAccount>> GetAllAsync() =>
        db.SystemAccounts.AsNoTracking().OrderBy(x => x.FullName).ToListAsync();

    public Task<SystemAccount?> GetByEmailAsync(string normalizedEmail) =>
        db.SystemAccounts.FirstOrDefaultAsync(x => x.Email.ToLower() == normalizedEmail);

    public Task<SystemAccount?> GetByIdAsync(int id) =>
        db.SystemAccounts.FirstOrDefaultAsync(x => x.AccountId == id);

    public Task<bool> EmailExistsAsync(string normalizedEmail, int? exceptAccountId = null) =>
        db.SystemAccounts.AnyAsync(x => x.Email.ToLower() == normalizedEmail &&
            (exceptAccountId == null || x.AccountId != exceptAccountId));

    public Task AddAsync(SystemAccount account)
    {
        db.SystemAccounts.Add(account);
        return Task.CompletedTask;
    }

    public void Delete(SystemAccount account) => db.SystemAccounts.Remove(account);

    public Task<bool> HasCreatedTasksAsync(int accountId) =>
        db.Tasks.AnyAsync(x => x.CreatedById == accountId);

    public Task<RefreshToken?> GetRefreshTokenAsync(string tokenHash) =>
        db.RefreshTokens.Include(x => x.Account).FirstOrDefaultAsync(x => x.TokenHash == tokenHash);

    public Task AddRefreshTokenAsync(RefreshToken token)
    {
        db.RefreshTokens.Add(token);
        return Task.CompletedTask;
    }

    public async Task RevokeAllRefreshTokensAsync(int accountId, DateTime revokedDate)
    {
        var activeTokens = await db.RefreshTokens
            .Where(x => x.AccountId == accountId && x.RevokedDate == null)
            .ToListAsync();
        foreach (var token in activeTokens) token.RevokedDate = revokedDate;
    }

    public Task<int> SaveChangesAsync() => db.SaveChangesAsync();
}

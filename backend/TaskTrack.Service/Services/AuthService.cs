using System.Security.Cryptography;
using TaskTrack.Repo.Repositories;
using TaskTrack.Service.Dtos;
using TaskTrack.Service.Exceptions;
using TaskTrack.Service.Interfaces;
using RefreshToken = TaskTrack.Repo.Models.RefreshToken;
using SystemAccount = TaskTrack.Repo.Models.SystemAccount;

namespace TaskTrack.Service.Services;

public class AuthService(
    IAccountRepository repository,
    IPasswordHasher passwordHasher,
    ITokenService tokenService) : IAuthService
{
    private static readonly TimeSpan RefreshLifetime = TimeSpan.FromDays(7);

    public async Task<AccountDto> RegisterAsync(RegisterRequest request)
    {
        var email = NormalizeEmail(request.Email);
        if (await repository.EmailExistsAsync(email))
            throw new ServiceException("An account with this email already exists.", 409);

        var account = new SystemAccount
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = passwordHasher.Hash(request.Password),
            Role = 0,
            CreatedDate = DatabaseNow()
        };
        await repository.AddAsync(account);
        await repository.SaveChangesAsync();
        return MapAccount(account);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var account = await repository.GetByEmailAsync(NormalizeEmail(request.Email));
        if (account is null || !passwordHasher.Verify(request.Password, account.PasswordHash))
            throw new ServiceException("Invalid email or password.", 401);

        return await IssueSessionAsync(account);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest request)
    {
        var now = DatabaseNow();
        var tokenHash = HashRefreshToken(request.RefreshToken);
        var existing = await repository.GetRefreshTokenAsync(tokenHash);
        if (existing is null || existing.RevokedDate is not null || existing.ExpiresDate <= now)
            throw new ServiceException("Refresh token is invalid or expired.", 401);

        var replacementRaw = CreateRefreshToken();
        var replacementHash = HashRefreshToken(replacementRaw);
        existing.RevokedDate = now;
        existing.ReplacedByTokenHash = replacementHash;
        await repository.AddRefreshTokenAsync(new RefreshToken
        {
            AccountId = existing.AccountId,
            TokenHash = replacementHash,
            CreatedDate = now,
            ExpiresDate = now.Add(RefreshLifetime)
        });
        await repository.SaveChangesAsync();

        var access = tokenService.CreateAccessToken(existing.Account);
        return new(access.Token, replacementRaw, access.ExpiresAt, MapAccount(existing.Account));
    }

    public async Task LogoutAsync(LogoutRequest request)
    {
        var existing = await repository.GetRefreshTokenAsync(HashRefreshToken(request.RefreshToken));
        if (existing is null || existing.RevokedDate is not null) return;
        existing.RevokedDate = DatabaseNow();
        await repository.SaveChangesAsync();
    }

    private async Task<AuthResponse> IssueSessionAsync(SystemAccount account)
    {
        var now = DatabaseNow();
        var refreshRaw = CreateRefreshToken();
        await repository.AddRefreshTokenAsync(new RefreshToken
        {
            AccountId = account.AccountId,
            TokenHash = HashRefreshToken(refreshRaw),
            CreatedDate = now,
            ExpiresDate = now.Add(RefreshLifetime)
        });
        await repository.SaveChangesAsync();
        var access = tokenService.CreateAccessToken(account);
        return new(access.Token, refreshRaw, access.ExpiresAt, MapAccount(account));
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
    private static string CreateRefreshToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    private static string HashRefreshToken(string token) => Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(token)));
    private static DateTime DatabaseNow() => DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
    public static AccountDto MapAccount(SystemAccount account) =>
        new(account.AccountId, account.FullName, account.Email, account.Role, account.CreatedDate);
}

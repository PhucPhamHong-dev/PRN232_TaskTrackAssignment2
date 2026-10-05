using System;

namespace TaskTrack.Repo.Models;

public class RefreshToken
{
    public int RefreshTokenId { get; set; }
    public int AccountId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public DateTime ExpiresDate { get; set; }
    public DateTime? RevokedDate { get; set; }
    public string? ReplacedByTokenHash { get; set; }

    public bool IsActive => RevokedDate is null && ExpiresDate > DateTime.UtcNow;
    public virtual SystemAccount Account { get; set; } = null!;
}

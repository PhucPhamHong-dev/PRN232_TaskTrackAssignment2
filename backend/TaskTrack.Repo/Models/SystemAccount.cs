using System;
using System.Collections.Generic;

namespace TaskTrack.Repo.Models;

public class SystemAccount
{
    public int AccountId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public short Role { get; set; }
    public DateTime CreatedDate { get; set; }

    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public virtual ICollection<Task> CreatedTasks { get; set; } = new List<Task>();
    public virtual ICollection<Task> UpdatedTasks { get; set; } = new List<Task>();
}

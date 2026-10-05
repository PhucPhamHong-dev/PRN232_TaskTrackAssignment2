using System.ComponentModel.DataAnnotations;

namespace TaskTrack.Service.Dtos;

public class RegisterRequest
{
    [Required, StringLength(150, MinimumLength = 2)] public string FullName { get; set; } = string.Empty;
    [Required, EmailAddress, StringLength(256)] public string Email { get; set; } = string.Empty;
    [Required, StringLength(128, MinimumLength = 8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$",
        ErrorMessage = "Password must contain uppercase, lowercase, number, and special characters.")]
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public class RefreshRequest
{
    [Required] public string RefreshToken { get; set; } = string.Empty;
}

public class LogoutRequest
{
    [Required] public string RefreshToken { get; set; } = string.Empty;
}

public record AccountDto(int AccountId, string FullName, string Email, short Role, DateTime CreatedDate);
public record AccessTokenResult(string Token, DateTime ExpiresAt);
public record AuthResponse(string AccessToken, string RefreshToken, DateTime ExpiresAt, AccountDto Account);

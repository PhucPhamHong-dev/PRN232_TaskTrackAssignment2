using TaskTrack.Service.Dtos;

namespace TaskTrack.Service.Interfaces;

public interface IAuthService
{
    Task<AccountDto> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshAsync(RefreshRequest request);
    Task LogoutAsync(LogoutRequest request);
}

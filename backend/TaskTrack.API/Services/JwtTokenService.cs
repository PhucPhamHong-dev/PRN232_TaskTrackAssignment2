using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TaskTrack.Repo.Models;
using TaskTrack.Service.Dtos;
using TaskTrack.Service.Interfaces;

namespace TaskTrack.API.Services;

public class JwtTokenService(IConfiguration configuration) : ITokenService
{
    public AccessTokenResult CreateAccessToken(SystemAccount account)
    {
        var secret = configuration["JWT_SECRET"] ?? configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT_SECRET must be configured.");
        var issuer = configuration["Jwt:Issuer"] ?? "TaskTrack.API";
        var audience = configuration["Jwt:Audience"] ?? "TaskTrack.Frontend";
        var minutes = configuration.GetValue("Jwt:AccessTokenMinutes", 30);
        var now = DateTime.UtcNow;
        var expires = now.AddMinutes(minutes);
        var role = account.Role == 1 ? "Admin" : "Staff";
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, account.AccountId.ToString()),
            new Claim("AccountID", account.AccountId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, account.Email),
            new Claim(ClaimTypes.Email, account.Email),
            new Claim(ClaimTypes.Name, account.FullName),
            new Claim(ClaimTypes.Role, role)
        };
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(issuer, audience, claims, now, expires, credentials);
        return new(new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}

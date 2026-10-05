using TaskTrack.Repo.Models;
using TaskTrack.Service.Dtos;

namespace TaskTrack.Service.Interfaces;

public interface ITokenService
{
    AccessTokenResult CreateAccessToken(SystemAccount account);
}

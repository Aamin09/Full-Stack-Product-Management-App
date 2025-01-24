using APIDeomWithImageCRUD.DTOs;

namespace APIDeomWithImageCRUD.Services
{
    public interface IAuthService
    {
        Task<ResponseDto> RegisterAsync(RegisterDto model);
        Task<ResponseDto> LoginAsync(LoginDto model);
        Task<ResponseDto> ForgotPasswordAsync(ForgotPasswordDto model);
        Task<ResponseDto> ResetPasswordAsync(ResetPasswordDto model);
        Task<ResponseDto> ConfirmEmailAsync(string userId, string token);
        Task<ResponseDto> LogoutAsync();

    }
}

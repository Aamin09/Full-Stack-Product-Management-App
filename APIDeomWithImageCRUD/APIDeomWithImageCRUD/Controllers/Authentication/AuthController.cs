using APIDeomWithImageCRUD.DTOs;
using APIDeomWithImageCRUD.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace APIDeomWithImageCRUD.Controllers.Authentication
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;

        public AuthController(IAuthService authService)
        {
            this.authService = authService;
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            var result = await authService.RegisterAsync(model);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto model)
        {
            var result = await authService.LoginAsync(model);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto model)
        {
            var result = await authService.ResetPasswordAsync(model);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto model)
        {
            var result = await authService.ForgotPasswordAsync(model);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("confirm-email")]
        public async Task<IActionResult> ComfirmEmail(string userId,string token)
        {
            var result = await authService.ConfirmEmailAsync(userId,token);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var result = await authService.LogoutAsync();
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }


        }
    }

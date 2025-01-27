using APIDeomWithImageCRUD.DTOs;
using APIDeomWithImageCRUD.Models;
using APIDeomWithImageCRUD.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace APIDeomWithImageCRUD.Controllers.Authentication
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;
        private readonly UserManager<ApplicationUser> userManager;

        public AuthController(IAuthService authService,UserManager<ApplicationUser> userManager)
        {
            this.authService = authService;
            this.userManager = userManager;
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
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailDto model)
        {
            var result = await authService.ConfirmEmailAsync(model.userId,model.token);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("resend-email-confirmation")]
        public async Task<IActionResult> ResendConfirmation([FromBody] string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "User ID cannot be null or empty"
                });
            }

            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return BadRequest(new { Message = "User not found" });
            }

            var response = await authService.GenerateAndSendConfirmationToken(user);
            
            if(response.IsSuccess)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var result = await authService.LogoutAsync();
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }


        }
    }

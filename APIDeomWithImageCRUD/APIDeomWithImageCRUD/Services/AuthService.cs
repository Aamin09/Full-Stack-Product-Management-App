using APIDeomWithImageCRUD.DTOs;
using APIDeomWithImageCRUD.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Tokens;
using Org.BouncyCastle.Bcpg.OpenPgp;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;

namespace APIDeomWithImageCRUD.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly SignInManager<ApplicationUser> signInManager;
        private readonly RoleManager<IdentityRole> roleManager;
        private readonly IConfiguration configuration;
        private readonly EmailService emailService;
        private readonly ILogger<AuthService> logger;
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly IDistributedCache cache;

        public AuthService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration, EmailService emailService, ILogger<AuthService> logger, IHttpContextAccessor httpContextAccessor, IDistributedCache cache)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.roleManager = roleManager;
            this.configuration = configuration;
            this.emailService = emailService;
            this.logger = logger;
            this.httpContextAccessor = httpContextAccessor;
            this.cache = cache;
        }

        public async Task<ResponseDto> LoginAsync(LoginDto model)
        {
            var user = await userManager.FindByNameAsync(model.UsernameOrEmail)
                 ?? await userManager.FindByEmailAsync(model.UsernameOrEmail);


            if (user == null)
                return new ResponseDto { IsSuccess = false, Message = "Invalid Username or Email" };

            // checking email confirmation

            if (!await userManager.IsEmailConfirmedAsync(user))
                return new ResponseDto { IsSuccess = false, Message = "Email not confirmed" };

            var passwordVerification = await userManager.CheckPasswordAsync(user, model.Password);
            if (!passwordVerification)
                return new ResponseDto { IsSuccess = false, Message = "Invalid Password" };

            // Another way to verify the password
            //var passwordHasher = new PasswordHasher<ApplicationUser>();
            //var verificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, model.Password);

            //if (verificationResult == PasswordVerificationResult.Failed)
            //{
            //    return new ResponseDto { IsSuccess = false, Message = "Invalid login attempt" };
            //}


            // Generate Jwt Token
            var roles = await userManager.GetRolesAsync(user);
            var token = GenerateJwtToken(user, roles);
            return new ResponseDto
            {
                IsSuccess = true,
                Message = "Login Successful",
                Token = token
            };
            throw new NotImplementedException();
        }

        public async Task<ResponseDto> LogoutAsync()
        {
            try
            {

                var user = await userManager.GetUserAsync(httpContextAccessor.HttpContext.User);
                if (user == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User is not logged in or token is invalid."
                    };
                }


                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "User successfully logged out."
                };
            }
            catch (Exception ex)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred during logout: {ex.Message}"
                };
            }
        }



        public async Task<ResponseDto> RegisterAsync(RegisterDto model)
        {
            if (await userManager.FindByNameAsync(model.Username) != null)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Username already exisits"
                };
            }
            if (await userManager.FindByEmailAsync(model.Email) != null)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Email already registered"
                };
            }

            var user = new ApplicationUser
            {
                UserName = model.Username,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                Gender = model.Gender,
                DateOfBirth = model.DateOfBirth,
                Address = model.Address,
            };

            var result = await userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return new ResponseDto { IsSuccess = false, Message = string.Join(",", result.Errors.Select(e => e.Description)) };

            // Default user role assignment
            await userManager.AddToRoleAsync(user, "User");

            // email sending and token code 
            await GenerateAndSendConfirmationToken(user);
          
            // generate jwt token
            var roles = await userManager.GetRolesAsync(user);
            var jwtToken = GenerateJwtToken(user, roles);

            return new ResponseDto
            {
                IsSuccess = true,
                Message = "User registered successfully. Please check your email to confirm your account.",
                Token = jwtToken
            };

        }

        public async Task<ResponseDto> GenerateAndSendConfirmationToken(ApplicationUser user)
        {
            // Generate a new token (Base64 encoded or custom encoding as required)
            var token = await userManager.GenerateEmailConfirmationTokenAsync(user);

            // Cache token with a 5-minute expiration
            var cacheOptions = new DistributedCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(5));

            await cache.SetStringAsync(
                $"confirm_token_{user.Id}",
                token,
                cacheOptions
            );

            // Generate the confirmation link
            var confirmLink = $"{configuration["AppSettings:ClientUrl"]}/email-confirm" +
                              $"?userId={WebUtility.UrlEncode(user.Id)}" +
                              $"&token={WebUtility.UrlEncode(token)}";

            // Send the email
            await emailService.SendEmailAsync(user.Email, "Confirm Your Account",
                $"Click the following link to confirm your account: <a href='{confirmLink}' style='text-decoration: none; color: blue;'>Confirm Email</a>");

            return new ResponseDto
            {
                IsSuccess = true,
                Message = "Confirmation token generated and sent"
            };
        }

        public async Task<ResponseDto> ConfirmEmailAsync(string userId, string token)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new ResponseDto { IsSuccess = false, Message = "User not found" };
            }

            // Retrieve the cached token
            var cachedToken = await cache.GetStringAsync($"confirm_token_{userId}");

            // Decode the incoming token and compare it with the cached token
            var decodedToken = WebUtility.UrlDecode(token);
            if (cachedToken == null || cachedToken != decodedToken)
            {
                // Regenerate and send a new token
                await GenerateAndSendConfirmationToken(user);
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Token expired. A new confirmation link has been sent. Please check your email."
                };
            }

            // Remove the used token from cache
            await cache.RemoveAsync($"confirm_token_{userId}");

            // Confirm the email
            var emailConfirmationToken = await userManager.GenerateEmailConfirmationTokenAsync(user);
            var result = await userManager.ConfirmEmailAsync(user, emailConfirmationToken);

            return result.Succeeded
                ? new ResponseDto { IsSuccess = true, Message = "Email confirmed successfully" }
                : new ResponseDto { IsSuccess = false, Message = string.Join(",", result.Errors.Select(e => e.Description)) };
        }

        public async Task<ResponseDto> ForgotPasswordAsync(ForgotPasswordDto model)
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return new ResponseDto { IsSuccess = false, Message = "No user found with this email" };

            // Generate password reset token
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebUtility.UrlEncode(token);

            // Reset password link code
            var resetLink = $"{configuration["AppSettings:ClientUrl"]}/reset-password" +
                   $"?email={WebUtility.UrlEncode(user.Email)}" +
                   $"&token={encodedToken}";

            // Send email for reset code
            await emailService.SendEmailAsync(
                user.Email,
                "Password Reset",
                $"Click the link to reset your password: <a href='{resetLink}' style='text-decoration:none;color:blue;'>Reset Password</a>"
            );

            return new ResponseDto
            {
                IsSuccess = true,
                Message = "Password reset link sent"
            };
        }

        public async Task<ResponseDto> ResetPasswordAsync(ResetPasswordDto model)
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return new ResponseDto { IsSuccess = false, Message = "User not found" };

            var decodedToken = Uri.UnescapeDataString(model.Token);

            try
            {
                // Reset Password
                var result = await userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);
                return result.Succeeded
                    ? new ResponseDto { IsSuccess = true, Message = "Password reset successful" }
                    : new ResponseDto
                    {
                        IsSuccess = false,
                        Message = string.Join(",", result.Errors.Select(e => e.Description))
                    };
            }
            catch (Exception ex)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Invalid or expired reset token. Please request a new password reset link."
                };
            }
        }

        private string GenerateJwtToken(ApplicationUser user, IList<string> roles)
        {
            var claims = new List<Claim>
            {
                 new Claim(ClaimTypes.NameIdentifier,user.Id),
                 new Claim(ClaimTypes.Name,user.UserName),
                 new Claim(ClaimTypes.Email,user.Email),
            };


            // Add role claims
            claims.AddRange(roles.Select(role=>new Claim(ClaimTypes.Role,role)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
            var creds=new SigningCredentials(key,SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: configuration["Jwt:Issuer"],
                audience: configuration["Jwt:Audience"],
                claims:claims,
                expires:DateTime.UtcNow.AddDays(1),
                signingCredentials:creds
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

     
    }
}

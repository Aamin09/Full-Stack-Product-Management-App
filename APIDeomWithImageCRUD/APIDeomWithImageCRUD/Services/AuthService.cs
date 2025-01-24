using APIDeomWithImageCRUD.DTOs;
using APIDeomWithImageCRUD.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
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

        public AuthService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration, EmailService emailService, ILogger<AuthService> logger, IHttpContextAccessor httpContextAccessor)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.roleManager = roleManager;
            this.configuration = configuration;
            this.emailService = emailService;
            this.logger = logger;
            this.httpContextAccessor = httpContextAccessor;
        }

        public async Task<ResponseDto> ConfirmEmailAsync(string userId, string token)
        {
            var user= await userManager.FindByIdAsync(userId);
            if(user == null)
            {
                return new ResponseDto { IsSuccess = false, Message = "User not found" };
            }
            var decodedToken=Uri.UnescapeDataString(token); 

            // confirm email
            var result=await userManager.ConfirmEmailAsync(user,decodedToken);

            return result.Succeeded
                ? new ResponseDto { IsSuccess = true, Message = "Email confirmed successfully" }
                : new ResponseDto { IsSuccess = false, Message = string.Join(",", result.Errors.Select(e => e.Description)) };

            throw new NotImplementedException();
        }

        public async Task<ResponseDto> ForgotPasswordAsync(ForgotPasswordDto model)
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return new ResponseDto { IsSuccess = false, Message = "No user found with this email" };

            //generate password reset token
            var token=await userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken=Uri.EscapeDataString(token);

            // reset password link code
            var resetLink = $"{configuration["AppSettings:ClientUrl"]}/confirm-email" +
                   $"?userId={Uri.EscapeDataString(user.Id)}" +
                   $"&token={encodedToken}";

            // send email for reset code
            await emailService.SendEmailAsync(
                user.Email,
                "Password Reset",
                $"Click the link to reset your password: {resetLink}"
                );

            return new ResponseDto
            {
                IsSuccess = true,
                Message = "Password reset link sent"
            };
            throw new NotImplementedException();
        }

        public async Task<ResponseDto> LoginAsync(LoginDto model)
        {
            ApplicationUser user = null;
            if(!string.IsNullOrEmpty(model.Username))
            {
                user=await userManager.FindByNameAsync(model.Username);
            }
            if (user == null && !string.IsNullOrEmpty(model.Email)) 
            {
                user = await userManager.FindByEmailAsync(model.Email);
            }

            if (user == null)
                return new ResponseDto { IsSuccess = false, Message = "User not found" };

            // checking email confirmation

            if (!await userManager.IsEmailConfirmedAsync(user))
                return new ResponseDto { IsSuccess = false, Message = "Email not confirmed" };

            var passwordVerification = await userManager.CheckPasswordAsync(user, model.Password);
            if (!passwordVerification)
                return new ResponseDto { IsSuccess = false, Message = "Invalid login attempt" };

            // Another way to verify the password
            //var passwordHasher = new PasswordHasher<ApplicationUser>();
            //var verificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, model.Password);

            //if (verificationResult == PasswordVerificationResult.Failed)
            //{
            //    return new ResponseDto { IsSuccess = false, Message = "Invalid login attempt" };
            //}


            // Generate Jwt Token
            var roles=await userManager.GetRolesAsync(user);    
            var token=GenerateJwtToken(user,roles);
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
            if(await userManager.FindByNameAsync(model.Username) != null){
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

            var result=await userManager.CreateAsync(user,model.Password);

            if (!result.Succeeded)
                return new ResponseDto { IsSuccess = false, Message = string.Join(",", result.Errors.Select(e => e.Description)) };

            // Default user role assignment
            await userManager.AddToRoleAsync(user, "User");

            // email confirmation code
            var confirmEmailToken = await userManager.GenerateEmailConfirmationTokenAsync(user);
            var confirmLink = $"{configuration["AppSettings:ClientUrl"]}/confirm-email" +
                   $"?userId={Uri.EscapeDataString(user.Id)}" +
                   $"&token={Uri.EscapeDataString(confirmEmailToken)}";

            await emailService.SendEmailAsync(user.Email, "Confirm Your Account", $"Click to confirm: {confirmLink}");

            // generate jwt token
            var roles=await userManager.GetRolesAsync(user); 
            var jwtToken=GenerateJwtToken(user,roles);

            return new ResponseDto
            {
                IsSuccess = true,
                Message = "User registered successfully",
                Token = jwtToken
            };
            throw new NotImplementedException();
        }

        public async Task<ResponseDto> ResetPasswordAsync(ResetPasswordDto model)
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return new ResponseDto { IsSuccess = false, Message = "User not found" };

            var decodedToken=Uri.UnescapeDataString(model.Token);
            // Reset Password
            var result = await userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);
            return result.Succeeded
                ? new ResponseDto { IsSuccess=true,Message="Password reset successful"}
                : new ResponseDto
                {
                    IsSuccess = false,
                    Message = string.Join(",", result.Errors.Select(e => e.Description))
                };

            throw new NotImplementedException();
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

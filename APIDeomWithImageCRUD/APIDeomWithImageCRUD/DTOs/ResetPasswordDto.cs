using System.ComponentModel.DataAnnotations;

namespace APIDeomWithImageCRUD.DTOs
{
    public class ResetPasswordDto
    {
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", ErrorMessage = "Invalid email address.")]

        [Required, EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Token { get; set; }
        [Required, MinLength(8)]
        public string NewPassword { get; set; }
    }
}

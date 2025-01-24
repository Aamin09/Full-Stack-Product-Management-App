using System.ComponentModel.DataAnnotations;

namespace APIDeomWithImageCRUD.DTOs
{
    public class LoginDto
    {
        [Required]
        public string Username { get; set; }
        [EmailAddress]
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", ErrorMessage = "Invalid email address.")]

        public string Email { get; set; }
        [Required,MinLength(8)]
        public string Password { get; set; }
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (string.IsNullOrEmpty(Username) && string.IsNullOrEmpty(Email))
            {
                yield return new ValidationResult("Either Username or Email is required.", new[] { "Username", "Email" });
            }
        }
    }
}

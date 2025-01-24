using System.ComponentModel.DataAnnotations;

public class LoginDto
{

    [Required(ErrorMessage = "Username or Email is required")]
    public string UsernameOrEmail { get; set; }

    [Required, MinLength(8)]
    public string Password { get; set; }

}

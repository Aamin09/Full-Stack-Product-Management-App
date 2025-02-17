﻿using System.ComponentModel.DataAnnotations;

namespace APIDeomWithImageCRUD.DTOs
{
    public class ForgotPasswordDto
    {
        [Required,EmailAddress]
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", ErrorMessage = "Invalid email address.")]

        public string Email { get; set; }
    }
}

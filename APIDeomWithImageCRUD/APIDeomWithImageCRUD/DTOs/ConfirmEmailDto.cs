using System.ComponentModel.DataAnnotations;

namespace APIDeomWithImageCRUD.DTOs
{
    public class ConfirmEmailDto
    {
        [Required]
        public string userId { get; set; }
        [Required]
        public string token { get; set; }
    }
}

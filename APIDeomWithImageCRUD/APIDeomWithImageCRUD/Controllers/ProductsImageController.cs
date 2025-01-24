using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using APIDeomWithImageCRUD.Models;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using APIDeomWithImageCRUD.Data;

namespace APIDeomWithImageCRUD.Controllers
{
    // Controller to manage product images (Upload, Edit, Delete, and Show Existing)
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsImageController : ControllerBase
    {
        private readonly ProductsApiContext _context;

        public ProductsImageController(ProductsApiContext context)
        {
            _context = context;
        }

        // Fetch all product images, including the product and its category
        [HttpGet]
        public async Task<IActionResult> GetAllImages()
        {
            var images = await _context.ProductImages.Include(p => p.Product).ThenInclude(c => c.Category).ToListAsync();
            if (images == null || !images.Any())
            {
                return NotFound("No images found.");
            }
            return Ok(images);
        }

        // Fetch images by productId
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetImagesByProductId(int productId)
        {
            var images = await _context.ProductImages.Where(x => x.ProductId == productId).ToListAsync();
            if (!images.Any())
            {
                return NotFound("No images found for this product.");
            }
            return Ok(images);
        }

        // Fetch image details by imageId (including product and category details)
        [HttpGet("{imageId}")]
        public async Task<IActionResult> GetImageById(int imageId)
        {
            var image = await _context.ProductImages
                .Include(p => p.Product)
                .ThenInclude(c => c.Category)
                .FirstOrDefaultAsync(x => x.ImageId == imageId);

            if (image == null)
            {
                return NotFound("Image not found.");
            }

            return Ok(image);
        }

        // Upload image for product
        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file, [FromForm] int productId, [FromForm] string imageName)
        {
            if (file == null || productId <= 0)
            {
                return BadRequest("Invalid data.");
            }

            try
            {
                // Generate a unique file name
                var newFileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images", newFileName);

                // Save the file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Create product image entity
                var productImage = new ProductImage
                {
                    ProductId = productId,
                    ImageName = imageName,
                    ImagePath = $"/images/{newFileName}",
                    UploadedDate = DateTime.UtcNow
                };

                // Save to database
                _context.ProductImages.Add(productImage);
                await _context.SaveChangesAsync();

                return Ok(new { message = "File uploaded successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while uploading the image.", details = ex.Message });
            }
        }

        // Edit existing image (upload new file or change image name)
        [HttpPut("edit/{imageId}")]
        public async Task<IActionResult> EditImage(int imageId, [FromForm] IFormFile? file, [FromForm] string imageName)
        {
            var image = await _context.ProductImages.FirstOrDefaultAsync(x => x.ImageId == imageId);

            if (image == null)
            {
                return NotFound("Image not found.");
            }

            // If a new file is uploaded, delete the old file and upload the new one
            if (file != null && file.Length > 0)
            {
                var imageDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");
                if (!Directory.Exists(imageDirectory))
                {
                    Directory.CreateDirectory(imageDirectory);
                }

                // Delete the old file if it exists
                var oldFilePath = Path.Combine(imageDirectory, Path.GetFileName(image.ImagePath.Substring(8)));
                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }

                // Generate new file name and save the new image
                var newFileName = $"{Guid.NewGuid()}_{file.FileName}";
                var newFilePath = Path.Combine(imageDirectory, newFileName);
                using (var stream = new FileStream(newFilePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                image.ImagePath = $"/images/{newFileName}";
                image.UploadedDate= DateTime.Now;
            }

            // Update image name
            image.ImageName = imageName;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Image updated successfully.", imagePath = image.ImagePath });
        }

        // Delete an image by imageId
        [HttpDelete("delete/{imageId}")]
        public async Task<IActionResult> DeleteImage(int imageId)
        {
            var image = await _context.ProductImages.FirstOrDefaultAsync(x => x.ImageId == imageId);

            if (image == null)
            {
                return NotFound("Image not found.");
            }

            // Delete the image file from server
            var imageDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");
            var filePath = Path.Combine(imageDirectory, Path.GetFileName(image.ImagePath.Substring(8)));
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            // Delete the image record from the database
            _context.ProductImages.Remove(image);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Image deleted successfully." });
        }
    }

}

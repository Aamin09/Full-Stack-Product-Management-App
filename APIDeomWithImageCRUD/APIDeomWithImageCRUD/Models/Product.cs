using APIDeomWithImageCRUD.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
public partial class Product
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ProductId { get; set; }
   
    public int CategoryId { get; set; }  // This is the foreign key for the category

    public string ProductName { get; set; } = null!;

    public string Description { get; set; } = null!;

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }

    // This is the navigation property, but it's not required in the request body
    [ForeignKey("CategoryId")]
    public virtual Category? Category { get; set; } 

    public virtual ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
}

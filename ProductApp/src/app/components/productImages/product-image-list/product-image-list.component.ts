import { Component, OnInit } from '@angular/core';
import { ProductImage, ProductImageService } from '../../../services/product-image.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-image-list',
  templateUrl: './product-image-list.component.html',
  styleUrls: ['./product-image-list.component.css'],
})
export class ProductImageListComponent implements OnInit {
  productImages: ProductImage[] = [];

  constructor(
    private productService: ProductImageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProductImages();
  }

  loadProductImages(): void {
    this.productService.getAll().subscribe(
      (data: ProductImage[]) => {
        this.productImages = data;
        console.log('Loaded product images:', this.productImages);
      },
      (error) => {
        console.error('Error fetching product images:', error);
      }
    );
  }

  viewDetails(id: number): void {
    this.router.navigate(['/product-images/details', id]);
  }

  editProduct(id: number): void {
    this.router.navigate(['/product-images/edit', id]);
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product image?')) {
      this.productService.delete(id).subscribe(
        () => {
          alert('Product image deleted successfully.');
          this.loadProductImages(); // Reload the list after deletion
        },
        (error) => {
          console.error('Error deleting product image:', error);
        }
      );
    }
  }
}

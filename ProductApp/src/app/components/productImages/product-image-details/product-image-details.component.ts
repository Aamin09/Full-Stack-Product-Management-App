import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';  
import { CategoryService } from '../../../services/category.service'; 
import { ProductImage, ProductImageService } from '../../../services/product-image.service';

@Component({
  selector: 'app-product-image-details',
  templateUrl: './product-image-details.component.html',
  styleUrls: ['./product-image-details.component.css']
})
export class ProductImageDetailsComponent implements OnInit {
  productImage: ProductImage | null = null;
  productName: string = '';
  categoryName: string = '';
  isLoading: boolean = false;
  imageId: number=0;

  constructor(
    private productImageService: ProductImageService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.imageId = +this.route.snapshot.paramMap.get('id')!;
    this.getProductImageDetails(this.imageId);
  }

  // Fetch product image details by imageId
  getProductImageDetails(imageId: number): void {
    this.isLoading = true;
    this.productImageService.getById(imageId).subscribe(
      (image) => {
        this.productImage = image;
        this.getProductDetails(image.productId);
      },
      (error) => {
        console.error('Error fetching product image details', error);
        this.isLoading = false;
      }
    );
  }

  // Fetch product details based on productId
  getProductDetails(productId: number): void {
    this.productService.getProductById(productId).subscribe(
      (product) => {
        this.productName = product.productName;
        this.getCategoryDetails(product.categoryId);
      },
      (error) => {
        console.error('Error fetching product details', error);
        this.isLoading = false;
      }
    );
  }

  // Fetch category details based on categoryId
  getCategoryDetails(categoryId: number): void {
    this.categoryService.getCategoryById(categoryId).subscribe(
      (category) => {
        this.categoryName = category.categoryName;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching category details', error);
        this.isLoading = false;
      }
    );
  }
}

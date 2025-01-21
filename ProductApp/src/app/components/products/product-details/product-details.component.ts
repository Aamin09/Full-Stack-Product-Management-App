import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent implements OnInit {
  product: Product | undefined;
  categoryName: string = ''; // Holds the category name

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    if (productId) {
      this.getProductDetails(productId);
    }
  }

  // Fetch product details
  getProductDetails(productId: number): void {
    this.productService.getProductById(productId).subscribe(
      (data: Product) => {
        this.product = data;
        if (this.product?.categoryId) {
          this.getCategoryName(this.product.categoryId); // Fetch the category name
        }
      },
      (error: any) => {
        console.error('Error fetching product details:', error);
        alert('Failed to load product details. Please try again later.');
      }
    );
  }

  // Fetch category name using CategoryService
  getCategoryName(categoryId: number): void {
    this.categoryService.getCategoryById(categoryId).subscribe(
      (category: Category) => {
        this.categoryName = category.categoryName;
      },
      (error: any) => {
        console.error('Error fetching category name:', error);
        this.categoryName = 'Unknown';
      }
    );
  }
}

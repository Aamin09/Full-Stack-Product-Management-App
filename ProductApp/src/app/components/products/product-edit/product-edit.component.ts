import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService, Category } from '../../../services/category.service';
import { ProductService, Product } from '../../../services/product.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css'],
})
export class ProductEditComponent implements OnInit {
  product: Product = {
    productId: 0,
    categoryId: 0,
    productName: '',
    description: '',
    price: 0,
    stockQuantity: 0,
  };

  categories: Category[] = []; // Holds the category list
  productId!: number; // Product ID from route

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productId = +this.route.snapshot.paramMap.get('id')!; // Fetch ID from route
    this.loadCategories(); // Load categories
    this.loadProductDetails(); // Load product details
  }

  // Fetch categories
  loadCategories(): void {
    this.categoryService.getCategories().subscribe(
      (data: Category[]) => {
        this.categories = data;
      },
      (error: any) => {
        console.error('Error fetching categories:', error);
        alert('Failed to load categories. Please try again.');
      }
    );
  }

  // Fetch product details by ID
  loadProductDetails(): void {
    this.productService.getProductById(this.productId).subscribe(
      (data: Product) => {
        this.product = data; // Pre-fill form with product data
      },
      (error: any) => {
        console.error('Error fetching product details:', error);
        alert('Failed to load product details. Please try again.');
      }
    );
  }

  // Handle form submission
  onSubmit(form: NgForm): void {
    if (form.valid) {
      console.log('Updating product:', this.product);

      this.productService.updateProduct(this.productId, this.product).subscribe(
        (response: any) => {
          alert('Product updated successfully!');
          this.router.navigate(['/products']); // Redirect after success
        },
        (error: any) => {
          console.error('Error updating product:', error);
          alert('An error occurred while updating the product.');
        }
      );
    } else {
      alert('Please fill out the form correctly.');
    }
  }
}

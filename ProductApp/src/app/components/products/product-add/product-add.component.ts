import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CategoryService, Category } from '../../../services/category.service';
import { ProductService, Product } from '../../../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-add',
  templateUrl: './product-add.component.html',
  styleUrls: ['./product-add.component.css'],
})
export class ProductAddComponent implements OnInit {
  product: Product = {
    productId: 0,
    categoryId: 0, // This will hold the category ID
    productName: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    
  };

  categories: Category[] = [];  // Holds the category list

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();  // Fetch categories on initialization
  }

  // Fetch categories using CategoryService
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

  // Handle form submission
  onSubmit(form: NgForm): void {
    if (form.valid) {
      console.log('Submitting product:', this.product);

      this.productService.addProduct(this.product).subscribe(
        (response: any) => {
          alert('Product added successfully!');
          this.router.navigate(['/products']);
          form.resetForm();

        },
        (error: any) => {
          console.error('Error adding product:', error);
          alert('An error occurred while adding the product.');
        }
      );
    } else {
      alert('Please fill out the form correctly.');
    }
  }
}

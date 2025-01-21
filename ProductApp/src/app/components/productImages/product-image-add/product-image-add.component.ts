import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductImageService } from '../../../services/product-image.service';
import { Product, ProductService } from '../../../services/product.service';
import { Category, CategoryService } from '../../../services/category.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-image-add',
  templateUrl: './product-image-add.component.html',
  styleUrls: ['./product-image-add.component.css'],
})
export class ProductImageAddComponent implements OnInit {
  categories: Category[] = [];
  products: Product[] = [];
  isLoadingProducts: boolean = false;
  addImageForm!: FormGroup;
  fileToUpload!: File | null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private productService: ProductService,
    private productImageService: ProductImageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
  }

  initializeForm(): void {
    this.addImageForm = this.fb.group({
      categoryId: ['', Validators.required],
      productId: [{ value: '', disabled: true }, Validators.required],
      imageName: ['', Validators.required], 
      file: [null, Validators.required], 
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(
      (categories) => {
        this.categories = categories;
      },
      () => {
        alert('Failed to load categories.');
      }
    );
  }

  onCategoryChange(): void {
    const selectedCategoryId = this.addImageForm.get('categoryId')?.value;

    if (selectedCategoryId) {
      this.isLoadingProducts = true;
      this.addImageForm.get('productId')?.reset();
      this.products = [];

      this.productService.getProductsByCategoryId(selectedCategoryId).subscribe(
        (products) => {
          this.products = products;
          this.isLoadingProducts = false;
          this.addImageForm.get('productId')?.enable();
        },
        () => {
          this.isLoadingProducts = false;
          alert('Failed to load products for the selected category.');
        }
      );
    } else {
      this.addImageForm.get('productId')?.disable();
    }
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.fileToUpload = event.target.files[0];
      this.addImageForm.patchValue({
        file: this.fileToUpload, // Update form value
      });
    }
  }
  
  

  uploadImage(): void {
    if (this.addImageForm.invalid) {
      alert('Please fill all required fields.');
      return;
    }

    // Prepare FormData for the API request
    const formData = new FormData();
    formData.append('file', this.fileToUpload as Blob);
    formData.append(
      'productId',
      this.addImageForm.get('productId')?.value.toString()
    );
    formData.append('imageName', this.addImageForm.get('imageName')?.value);

    // Call the service to upload the image
    this.productImageService.createImage(formData).subscribe(
      (response) => {
        console.log('Image uploaded successfully', response);
        alert('Image uploaded successfully.');
        this.router.navigate(['/product-images']);
        this.addImageForm.reset();
        this.addImageForm.get('productId')?.disable();
      },
      (error) => {
        console.error('Upload error:', error);
        alert('Failed to upload the image. Error: ' + (error.error?.message || error.message));
      }
    );
    
  }
  // Navigate back to the product image list
  goBack() {
    this.router.navigate(['/product-images']);
  }
  resetForm(): void {
    this.addImageForm.reset();
    this.addImageForm.get('productId')?.disable();
    this.fileToUpload = null;
  }
}

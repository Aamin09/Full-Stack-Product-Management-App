import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductImageService } from '../../../services/product-image.service';
import { Product, ProductService } from '../../../services/product.service';
import { Category, CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-product-image-edit',
  templateUrl: './product-image-edit.component.html',
  styleUrls: ['./product-image-edit.component.css'],
})
export class ProductImageEditComponent implements OnInit {
  categories: Category[] = [];
  products: Product[] = [];
  isLoadingProducts: boolean = false;
  isLoadingImage: boolean = false;
  editImageForm!: FormGroup;
  fileToUpload!: File | null;
  imageId: number = 0;
  imagePath: string = '';

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private productService: ProductService,
    private productImageService: ProductImageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
    this.loadImageDetails();
  }

  initializeForm(): void {
    this.editImageForm = this.fb.group({
      categoryId: ['', Validators.required],
      productId: [{ value: '', disabled: true }, Validators.required],
      imageName: ['', Validators.required],
      file: [null],
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

  loadImageDetails(): void {
    this.isLoadingImage = true;
    this.imageId = +this.route.snapshot.paramMap.get('id')!;
    
    this.productImageService.getById(this.imageId).subscribe(
      (image) => {
        const { productId, imageName, imagePath, product } = image;
        
        // Set image path for display
        this.imagePath = imagePath ? imagePath : ''; // Check if the imagePath exists

        // Patch the form with image details
        this.editImageForm.patchValue({
          productId: productId,
          imageName: imageName,
          categoryId: product?.categoryId ?? 0,  // Set the category if available
        });

        // Load products for the corresponding category
        const categoryId = product?.categoryId ?? 0;
        this.loadProductsByCategory(categoryId);

        this.isLoadingImage = false;
      },
      () => {
        this.isLoadingImage = false;
        alert('Failed to load image details.');
      }
    );
  }

  loadProductsByCategory(categoryId: number): void {
    this.productService.getProductsByCategoryId(categoryId).subscribe(
      (products) => {
        this.products = products;
      },
      () => {
        alert('Failed to load products for the selected category.');
      }
    );
  }

  onCategoryChange(): void {
    const selectedCategoryId = this.editImageForm.get('categoryId')?.value;

    if (selectedCategoryId) {
      this.isLoadingProducts = true;
      this.editImageForm.get('productId')?.reset();
      this.products = [];

      this.productService.getProductsByCategoryId(selectedCategoryId).subscribe(
        (products) => {
          this.products = products;
          this.isLoadingProducts = false;
          this.editImageForm.get('productId')?.enable();
        },
        () => {
          this.isLoadingProducts = false;
          alert('Failed to load products for the selected category.');
        }
      );
    } else {
      this.editImageForm.get('productId')?.disable();
    }
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.fileToUpload = event.target.files[0];
      this.editImageForm.patchValue({
        file: this.fileToUpload,
      });
    }
  }

  updateImage(): void {
    if (this.editImageForm.invalid) {
      alert('Please fill all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('imageId', this.imageId.toString());
    formData.append('productId', this.editImageForm.get('productId')?.value.toString());
    formData.append('imageName', this.editImageForm.get('imageName')?.value);

    if (this.fileToUpload) {
      formData.append('file', this.fileToUpload, this.fileToUpload.name);
    }

    this.productImageService.update(this.imageId, formData).subscribe(
      (response) => {
        alert('Image updated successfully.');
        this.router.navigate(['/product-images']);
      },
      (error) => {
        console.error('Update error:', error);
        alert('Failed to update the image. Error: ' + (error.error?.message || error.message));
      }
    );
  }

  // Navigate back to the product image list
  goBack() {
    this.router.navigate(['/product-images']);
  }
}

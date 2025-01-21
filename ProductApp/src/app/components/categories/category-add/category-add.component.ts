import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Category, CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-category-add',
  templateUrl: './category-add.component.html',
  styleUrls: ['./category-add.component.css']
})
export class CategoryAddComponent {
  category: Category = {
    categoryId: 0,
    categoryName: '',
    description: '',
    products: []
  };

  constructor(private categoryService: CategoryService, private router: Router) {}

  onSubmit(): void {
    if (this.category.categoryName && this.category.description) {
      this.categoryService.addCategory(this.category).subscribe(() => {
        alert('Category added successfully');
        this.router.navigate(['/categories']);
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category, CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-category-edit',
  templateUrl: './category-edit.component.html',
  styleUrls: ['./category-edit.component.css']
})
export class CategoryEditComponent implements OnInit {
  category: Category = {
    categoryId: 0,
    categoryName: '',
    description: '',
    products: []
  };

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.categoryService.getCategoryById(id).subscribe(data => {
      this.category = data;
    });
  }

  onSubmit(): void {
    if (this.category.categoryName && this.category.description) {
      this.categoryService.updateCategory(this.category.categoryId, this.category).subscribe(() => {
        alert('Category updated successfully');
        this.router.navigate(['/categories']);
      });
    }
  }
}

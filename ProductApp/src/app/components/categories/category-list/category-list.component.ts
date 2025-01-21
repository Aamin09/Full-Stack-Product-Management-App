import {  Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Category, CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit  {
  categories: Category[] = [];

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private renderer: Renderer2
  ) {}
  

  ngOnInit(): void {
    this.loadCategories();
  }
 
  loadCategories(): void {
    this.categoryService.getCategories().subscribe(
      (data: Category[]) => {
        this.categories = data;
      },
      (error) => {
        console.error('Error fetching categories:', error);
      }
    );
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe(() => {
        alert('Category deleted successfully');
        this.loadCategories(); // Reload the list after deletion
      });
    }
  }

  viewDetails(id: number): void {
    this.router.navigate(['/categories/details', id]);
  }

  editCategory(id: number): void {
    this.router.navigate(['/categories/edit', id]);
  }

 // Tooltip functionality
 onRowHover(event: MouseEvent, description: string): void {
  const tooltip = document.getElementById('hover-tooltip');
  const tooltipText = tooltip?.querySelector('.tooltip-text');
  if (tooltip && tooltipText) {
    tooltipText.textContent = description;
    tooltip.style.top = `${event.clientY + 10}px`;
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.classList.remove('d-none');
  }
}

onRowLeave(event: MouseEvent): void {
  const tooltip = document.getElementById('hover-tooltip');
  if (tooltip) {
    tooltip.classList.add('d-none');
  }
}
}

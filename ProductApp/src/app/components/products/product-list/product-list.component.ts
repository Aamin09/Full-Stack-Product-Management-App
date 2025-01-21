import { Component, OnInit, Renderer2 } from '@angular/core';
import { Product, ProductService } from '../../../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
   products: Product[] = [];
   
     constructor(
       private productService: ProductService,
       private router: Router,
       private renderer: Renderer2
     ) {}
   
     ngOnInit(): void {
       this.loadProducts();
     }
   
     loadProducts(): void {
       this.productService.getProducts().subscribe(
         (data: Product[]) => {
           this.products = data;
         },
         (error) => {
           console.error('Error fetching products:', error);
         }
       );
     }
   
     deleteProduct(id: number): void {
       if (confirm('Are you sure you want to delete this product?')) {
         this.productService.deleteProduct(id).subscribe(() => {
           alert('Product deleted successfully');
           this.loadProducts(); // Refresh the list after deletion
         });
       }
     }
   
     viewDetails(id: number): void {
       this.router.navigate(['/products/details', id]);
     }
   
     editProduct(id: number): void {
       this.router.navigate(['/products/edit', id]);
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

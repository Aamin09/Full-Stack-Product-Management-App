import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductImage {
  imageId: number;
  productId: number;
  imageName: string;
  imagePath: string;
  uploadedDate: string;
  product?: {
    productId: number;
    productName: string;
    categoryId: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ProductImageService {
  private apiUrl = 'https://localhost:7271/api/ProductsImage';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProductImage[]> {
    return this.http.get<ProductImage[]>(this.apiUrl);
  }

  // Fetch product images by productId
  getImagesByProductId(productId: number): Observable<ProductImage[]> {
    return this.http.get<ProductImage[]>(`${this.apiUrl}/product/${productId}`);
  }

  getById(id: number): Observable<ProductImage> {
    return this.http.get<ProductImage>(`${this.apiUrl}/${id}`);
  }

  createImage(formData: FormData): Observable<ProductImage> {
    return this.http.post<ProductImage>(`${this.apiUrl}/upload`, formData);
  }

  update(imageId: number, formData: FormData): Observable<any> {
    const url = `${this.apiUrl}/edit/${imageId}`;
    return this.http.put(url, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}

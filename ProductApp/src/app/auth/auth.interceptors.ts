import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { error } from "jquery";
import { catchError, Observable, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('access_token');
    
    console.log('Current Token:', token);
    console.log('User Roles:', this.authService.getUserRoles());

    if (token) {
      req = req.clone({
        setHeaders: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Full Error Response:', {
          status: error.status,
          message: error.message,
          error: error.error
        });

        if (error.status === 401) {
          this.authService.logoutClientSide();
          this.router.navigate(['/login']);
          alert('Session expired. Please log in again.');
        }

        if (error.status === 403) {
          this.router.navigate(['/unauthorized']);
          alert('Access Denied: Insufficient Permissions');
        }

        return throwError(error);
      })
    );
  }
}
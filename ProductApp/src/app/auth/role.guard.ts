import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { fromReadableStreamLike } from "rxjs/internal/observable/innerFrom";
@Injectable({
    providedIn: 'root'
  })
  export class AdminGuard implements CanActivate {
    constructor(
      private authService: AuthService,
      private router: Router
    ) {}
  
    canActivate(
      route: ActivatedRouteSnapshot, 
      state: RouterStateSnapshot
    ): boolean {
      // Check if user is logged in
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/login']);
        alert('Please log in to access this page.');
        return false;
      }
  
      // Check for admin role with more robust checking
      const userRoles = this.authService.getUserRoles();
      const isAdmin = userRoles.some(
        role => role.toLowerCase() === 'admin'
      );
  
      if (!isAdmin) {
        this.router.navigate(['/']);
        alert('Access denied: Admins only.');
        return false;
      }
  
      return true;
    }
  }
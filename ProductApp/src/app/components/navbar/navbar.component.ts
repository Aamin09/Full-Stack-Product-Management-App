import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router'; // Add Router import

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isAuthenticated: boolean = false;
  username: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    // Check authentication status on component initialization
    this.checkAuthStatus();
  }

  // Method to check and update authentication status
  checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    if (this.isAuthenticated) {
      this.username = this.getUsernameFromToken();
    } else {
      this.username = '';
    }
  }

  getUsernameFromToken(): string {
    const token = this.authService.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken?.unique_name || '';
    }
    return '';
  }

  logout() {
    this.authService.logoutClientSide();
    this.checkAuthStatus(); // Update status after logout
    this.router.navigate(['/login']); // Redirect to login page
  }
}
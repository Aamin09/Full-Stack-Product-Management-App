import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  username = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Use BehaviorSubject in AuthService for immediate update
    this.authService.currentAuthStatus.subscribe(status => {
      this.isAuthenticated = status.isLoggedIn;
      this.username = status.username;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
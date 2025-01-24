import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginDto } from '../../interfaces/auth.models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userIdentifier: ['', [
        Validators.required,
        this.validateUserIdentifier
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$')
      ]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {}

  // Getter for easy access to form controls
  get f() {
    return this.loginForm.controls;
  }

  // Custom validator for user identifier
  validateUserIdentifier(control:any) {
    const value = control.value;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (!value || (emailRegex.test(value) || usernameRegex.test(value))) {
      return null;
    }
    return { 'invalidUserIdentifier': true };
  }
  login(): void {
    this.loginForm.markAllAsTouched();
  
    if (this.loginForm.invalid) {
      // Collect validation errors
      const errors = [];
      
      if (this.loginForm.get('userIdentifier')?.errors) {
        if (this.loginForm.get('userIdentifier')?.hasError('required')) {
          errors.push('Username/Email is required');
        }
        if (this.loginForm.get('userIdentifier')?.hasError('invalidUserIdentifier')) {
          errors.push('Invalid username or email format');
        }
      }
  
      if (this.loginForm.get('password')?.errors) {
        if (this.loginForm.get('password')?.hasError('required')) {
          errors.push('Password is required');
        }
        if (this.loginForm.get('password')?.hasError('minlength')) {
          errors.push('Password must be at least 8 characters');
        }
        if (this.loginForm.get('password')?.hasError('pattern')) {
          errors.push('Password must include uppercase, lowercase, number, and special character');
        }
      }
  
      // Show validation errors
      if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
      }
    }
  
    const credentials: LoginDto = {
      usernameOrEmail: this.loginForm.get('userIdentifier')?.value ?? '',
      password: this.loginForm.get('password')?.value ?? ''
    };
  
    this.authService.login(credentials).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Success alert
          alert('Login Successful!');
          this.authService.setSession(res);
          this.router.navigate(['/categories']);
        } else {
          // Server-side error alert
          alert(res.message || 'Login failed');
        }
      },
      error: (err) => {
        // Network or unexpected error alert
        const errorMessage = err.error?.message || 
                             err.message || 
                             'An unexpected error occurred';
        alert(errorMessage);
      }
    });
  }
}
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

  get f() {
    return this.loginForm.controls;
  }

  validateUserIdentifier(control: any) {
    const value = control.value;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    return !value || (emailRegex.test(value) || usernameRegex.test(value)) 
      ? null 
      : { 'invalidUserIdentifier': true };
  }

  login(): void {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    const credentials: LoginDto = {
      usernameOrEmail: this.loginForm.get('userIdentifier')?.value ?? '',
      password: this.loginForm.get('password')?.value ?? ''
    };

    this.authService.login(credentials).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.authService.setSession(res);
          this.router.navigate(['/home']);
        } else {
          alert(res.message || 'Login failed');
        }
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'An unexpected error occurred';
        alert(errorMessage);
      }
    });
  }
}
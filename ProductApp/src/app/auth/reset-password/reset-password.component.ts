import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ResetPasswordDto } from '../../interfaces/auth.models';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  email: string = '';
  token: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'];
      this.token = params['token'];
  
      if (!this.email || !this.token) {
        this.errorMessage = 'Invalid password reset link.';
        return;
      }
  
      // Decode the token before using it
      this.token = decodeURIComponent(this.token);
  
      // Initialize form
      this.resetPasswordForm = this.fb.group(
        {
          newPassword: ['', [Validators.required, Validators.minLength(8)]],
          confirmPassword: ['', [Validators.required]],
        },
        { validator: this.passwordsMatch }
      );
    });
  }
  

  passwordsMatch(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Important: Don't decode the token, send it as-is
    const resetData: ResetPasswordDto = {
      email: this.email,
      token: this.token, // Remove decodeURIComponent
      newPassword: this.resetPasswordForm.get('newPassword')?.value
    };

    this.authService.resetPassword(resetData).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          alert('Password reset successful! Please login.');
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = response.message || 'Password reset failed';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error("API Error:", error);
        this.errorMessage = error.error?.message || 'Something went wrong.';
        this.isLoading = false;
      }
    });
  }
}

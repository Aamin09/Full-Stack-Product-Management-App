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
  successMessage: string = '';
  passwordResetSuccess: boolean = false;

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
  
      this.resetPasswordForm = this.fb.group(
        {
          newPassword: ['', [Validators.required, Validators.minLength(8)]],
          confirmPassword: ['', [Validators.required]]
        },
        { validator: this.passwordsMatch } // Apply validator at form group level
      );
    });
  }
  
  passwordsMatch(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password && confirmPassword && password === confirmPassword
      ? null
      : { mismatch: true }; // Return 'mismatch' error if passwords don't match
  }
  

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';


    const resetData: ResetPasswordDto = {
      email: this.email,
      token: this.token,
      newPassword: this.resetPasswordForm.get('newPassword')?.value
    };

    this.authService.resetPassword(resetData).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.passwordResetSuccess = true;
          this.successMessage = 'Password reset successful! Please login.';
          this.router.navigate(['/login']); // Navigate to login after success
        } else {
          this.passwordResetSuccess = false;
          this.errorMessage = response.message || 'Password reset failed.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error("API Error:", error);
        this.passwordResetSuccess = false;
        this.errorMessage = error.error?.message || 'Something went wrong.';
        this.isLoading = false;
      }
    });
  }
  get f() {
    return this.resetPasswordForm.controls;
  }

  // New method to retry password reset
  retryResetPassword(): void {
    this.errorMessage = ''; // Clear the error message
    this.passwordResetSuccess = false; // Reset success state
    this.isLoading = false; // Reset loading state
  }
}

import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RegisterDto } from '../../interfaces/auth.models';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{
 registerForm:FormGroup;

constructor(
  private fb:FormBuilder,
  private authService:AuthService,
  private router:Router
) {
  this.registerForm=this.fb.group({
    userName:['',[Validators.required,Validators.minLength(3)]],
    email:['',[Validators.required,Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
    password:['',[Validators.required,Validators.minLength(8),Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$')]],
    firstName:['',[Validators.required]],
    lastName:['',[Validators.required]],
    gender:['',[Validators.required]],
    dateOfBirth:['',[Validators.required]],
    address:['',[Validators.required]],
    confirmPassword:['',[Validators.required,this.passwordMatchValidator]]
  },{ validators: this.passwordMatchValidator() });

}

register(): void {
  this.registerForm.markAllAsTouched();
  if (this.registerForm.invalid) {
    return;
  }

  const userData: RegisterDto = this.registerForm.value;
  delete userData.confirmPassword;

  this.authService.register(userData).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        alert(res.message || 'Registration successfully completed!');
        this.router.navigate(['/email-confirm']);
      } else {
        alert(res.message || 'Registration failed');
      }
    },
    error: (err) => {
      const errorMessage = err.error?.message || err.message || 'An unexpected error occurred';
      alert(errorMessage);
    },
  });
}

// Custom validator function
passwordMatchValidator(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');

    // Check if both controls exist and passwords don't match
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } 

    // Clear previous passwordMismatch error if passwords match
    if (confirmPassword && confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }

    return null;
  };
}

  
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  get f(){
    return this.registerForm.controls;
  }

}

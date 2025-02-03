import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ForgotPasswordDto } from '../../interfaces/auth.models';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {

  forgotForm:FormGroup;
  constructor(private fb:FormBuilder,
    private authService:AuthService,
    private router:Router
  ){
    this.forgotForm=this.fb.group({
      email:['',[Validators.required,Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]]
    });
  }
  
  forgot():void{
    this.forgotForm.markAllAsTouched();
    if(this.forgotForm.invalid){
      return;
    }

    const email:ForgotPasswordDto=this.forgotForm.value;

    this.authService.forgotPassword(email).subscribe({
      next:(res)=>{
        if(res.isSuccess){
          this.router.navigate(['/reset-password']);
        }else{
          alert(res.message || 'Email is not found.');
        }
      },
      error:(err)=>{
        const errorMessage = err.error?.message || err.message || 'An unexpected error occurred';
        alert(errorMessage);
      }
    })
  }

  get f(){
    return this.forgotForm.controls;
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

}

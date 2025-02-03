import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.css']
})
export class EmailConfirmationComponent implements OnInit {
  userId: string | null = null;
  token: string | null = null;
  isLoading = true;
  confirmationMessage: string = '';
  confirmationSuccess: boolean = false;
  isExpired = false;
  
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      console.log('Query Parameters:', params); // Debug log
      this.userId = params['userId'];
      this.token = params['token'];

      if (this.userId && this.token) {
        this.confirmEmail();
      } else {
        this.handleInvalidLink();
      }
    });
  }
  confirmEmail(): void {
    if (!this.userId || !this.token) return;
  
    const decodedUserId = decodeURIComponent(this.userId);
    const decodedToken = decodeURIComponent(this.token);
  
    this.authService.confirmEmail(decodedUserId, decodedToken).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.confirmationSuccess = true;
          this.confirmationMessage = 'Email confirmed successfully!';
        } else {
          this.confirmationMessage = res.message || 'Email confirmation failed.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.confirmationMessage = 
          err.error?.message || 
          'An error occurred during email confirmation.';
        console.error('Confirmation error:', err);
      }
    });
  }

  resendToken():void{
    if(!this.userId) return;

    const decodedUserId=decodeURIComponent(this.userId);

    this.authService.resendEmailConfirmation(decodedUserId).subscribe({
      next:(res)=>{
        if(res.isSuccess){
          this.isExpired=false;
          this.confirmationMessage='A new confirmation email has been sent. Please check your inbox.';
        }else{
          this.confirmationMessage=res.message|| 'Failed to resend the confirmation email.';
        }
      },
      error:(err)=>{
        this.confirmationMessage=err.error?.message|| 'An error occurred while resending the confirmation email.';
      }
    });
  }
  handleInvalidLink(): void {
    this.isLoading = false;
    this.confirmationMessage =
      'Invalid or missing confirmation link. Please check your email or request a new confirmation.\nYour email confirmation time is 5 minutes';
  }
  navigateToRegister(){
    this.router.navigate(['/register']);
  }
  navigateToLogin(){
    this.router.navigate(['/login']);
  }
}

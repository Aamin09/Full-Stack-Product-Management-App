import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse, AuthStatus, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from '../interfaces/auth.models';
import { BehaviorSubject, catchError, Observable, Subject, tap } from 'rxjs';
import moment from 'moment';
import {jwtDecode  } from 'jwt-decode'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl='https://localhost:7271/api/Auth';

  private authChangeSubject = new Subject<void>();
  authChanged = this.authChangeSubject.asObservable();
  constructor(private http:HttpClient) { }

  login(crediential:LoginDto):Observable<ApiResponse>{
    return this.http.post<ApiResponse>(`${this.apiUrl}/login`,crediential).pipe(
      tap(response => {
        if (response && response.token) {
          this.setSession(response);
          this.updateAuthStatus();
          // Emit authentication change
          this.authChangeSubject.next();
        }
      })
    );
  }

  register(userData:RegisterDto):Observable<ApiResponse>{
    return this.http.post<ApiResponse>(`${this.apiUrl}/register`,userData);
  }

  forgotPassword(email:ForgotPasswordDto):Observable<ApiResponse>{
    return this.http.post<ApiResponse>(`${this.apiUrl}/forgot-password`,email);
  }

  resetPassword(resetData:ResetPasswordDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/reset-password`, resetData);
  }

  confirmEmail(userId:string,token:string):Observable<ApiResponse>{
    return this.http.post<ApiResponse>(`${this.apiUrl}/confirm-email`, { userId, token }, 
      { headers: { 'Content-Type': 'application/json' } });
  }

  resendEmailConfirmation(userId:string):Observable<ApiResponse>{
    return this.http.post<ApiResponse>(`${this.apiUrl}/resend-email-confirmation`, { userId }, 
      { headers: { 'Content-Type': 'application/json' } });
  }
  logout():Observable<ApiResponse>{
    this.logoutClientSide();
    this.updateAuthStatus();
    return this.http.post<ApiResponse>(`${this.apiUrl}/logout`, {});
  }
   setSession(authResult:ApiResponse):void{
    if(authResult.token){
      localStorage.setItem('access_token',authResult.token);
      localStorage.setItem('expires_at',moment().add(1,'hour').toString());
    } 
  }
  isLoggedIn(): boolean {
    const expiration = localStorage.getItem('expires_at');
    return expiration ? moment().isBefore(moment(expiration)) : false;
  }

 // Retrieve token from localStorage
 getToken(): string | null {
  return localStorage.getItem('access_token');
 }

// Decode token to get user roles
getUserRoles(): string[] {
  const token = this.getToken();
  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      
      // Multiple strategies to extract roles
      const roles = 
        decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        decodedToken['roles'] || 
        decodedToken['role'] || 
        [];

      // Normalize roles to array
      return Array.isArray(roles) 
        ? roles.map(r => r.toLowerCase())
        : [roles.toLowerCase()].filter(Boolean);

    } catch (error) {
      console.error('Token Decoding Error:', error);
      return [];
    }
  }
  return [];
}

isAdmin(): boolean {
  const roles = this.getUserRoles();
  return roles.includes('admin');
}


private getCurrentUsername(): string {
  const token = this.getToken();
  if (token) {
    const decodedToken: any = jwtDecode(token);
    return decodedToken?.unique_name || 
           decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '';
  }
  return '';
}


  // BehaviorSubject to track auth status across app
  private authStatusSubject = new BehaviorSubject<AuthStatus>({
    isLoggedIn: this.isLoggedIn(),
    username: this.getCurrentUsername()
  });
  
  currentAuthStatus = this.authStatusSubject.asObservable();

 // Method to update auth status
 private updateAuthStatus(): void {
  this.authStatusSubject.next({
    isLoggedIn: this.isLoggedIn(),
    username: this.getCurrentUsername()
  });
}


  logoutClientSide(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_at');
    this.authChangeSubject.next();
  }
}



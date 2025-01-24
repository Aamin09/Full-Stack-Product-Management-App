import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse, ForgotPasswordDto, LoginDto, RegisterDto } from '../interfaces/auth.models';
import { Observable, tap } from 'rxjs';
import moment from 'moment';
import {jwtDecode  } from 'jwt-decode'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl='https://localhost:7271/api/Auth';

  constructor(private http:HttpClient) { }

  login(crediential:LoginDto):Observable<ApiResponse>{
    return this.http.post<ApiResponse>(`${this.apiUrl}/login`,crediential).pipe(
      tap(response => {
        if (response && response.token) {
          this.setSession(response);
        }
      })
    );;
  }

  register(userData:RegisterDto):Observable<ApiResponse>{
    return this.http.post<ApiResponse>(`${this.apiUrl}/register`,userData);
  }

  forgotPassword(email:ForgotPasswordDto):Observable<ApiResponse>{
    return this.http.post<ApiResponse>(`${this.apiUrl}/forgot-password`,email);
  }

  resetPassword(resetData:RegisterDto):Observable<ApiResponse>{
    return this.http.post<ApiResponse>(`${this.apiUrl}/reset-password`,resetData);
  }

  confirmEmail(userId:string,token:string):Observable<ApiResponse>{
    return this.http.post<ApiResponse>(`${this.apiUrl}/confirm-email`,{userId,token});
  }

  logout():Observable<ApiResponse>{
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


  logoutClientSide(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_at');
  }
}



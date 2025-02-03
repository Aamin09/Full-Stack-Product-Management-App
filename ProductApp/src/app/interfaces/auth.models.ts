export interface LoginDto {
    usernameOrEmail:string;
    password:string;
}

export interface AuthStatus {
  isLoggedIn: boolean;
  username: string;
}

export interface RegisterDto{
    userName:string;
    email:string;
    firstName:string;
    lastName:string;
    gender:string;
    dateOfBirth:Date;
    address:string;
    password:string;
    confirmPassword?: string;
}

export interface ForgotPasswordDto{
    email:string;
}

export interface ResetPasswordDto{
    email: string;
    token: string;
    newPassword: string;
    
}

export interface ApiResponse<T = any> {
    isSuccess: boolean;
    message: string;
    token?: string;
    data?: T;
  }
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Correctly imported
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CategoryAddComponent } from './components/categories/category-add/category-add.component';
import { CategoryEditComponent } from './components/categories/category-edit/category-edit.component';
import { CategoryDetailsComponent } from './components/categories/category-details/category-details.component';
import { CategoryListComponent } from './components/categories/category-list/category-list.component';
import { ProductAddComponent } from './components/products/product-add/product-add.component';
import { ProductEditComponent } from './components/products/product-edit/product-edit.component';
import { ProductDetailsComponent } from './components/products/product-details/product-details.component';
import { ProductListComponent } from './components/products/product-list/product-list.component';
import { ProductImageListComponent } from './components/productImages/product-image-list/product-image-list.component';
import { ProductImageAddComponent } from './components/productImages/product-image-add/product-image-add.component';
import { ProductImageDetailsComponent } from './components/productImages/product-image-details/product-image-details.component';
import { ProductImageEditComponent } from './components/productImages/product-image-edit/product-image-edit.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthInterceptor } from './auth/auth.interceptors';
import { EmailConfirmationComponent } from './auth/email-confirmation/email-confirmation.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { HomeComponent } from './components/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    CategoryListComponent,
    CategoryAddComponent,
    CategoryEditComponent,
    CategoryDetailsComponent,
    ProductListComponent,
    ProductAddComponent,
    ProductEditComponent,
    ProductDetailsComponent,
    ProductImageListComponent,
    ProductImageAddComponent,
    ProductImageDetailsComponent,
    ProductImageEditComponent,
    NavbarComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    EmailConfirmationComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule, 
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {provide:HTTP_INTERCEPTORS,useClass:AuthInterceptor,multi:true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

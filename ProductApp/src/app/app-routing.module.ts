import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryListComponent } from './components/categories/category-list/category-list.component';
import { CategoryAddComponent } from './components/categories/category-add/category-add.component';
import { CategoryEditComponent } from './components/categories/category-edit/category-edit.component';
import { CategoryDetailsComponent } from './components/categories/category-details/category-details.component';
import { ProductAddComponent } from './components/products/product-add/product-add.component';
import { ProductEditComponent } from './components/products/product-edit/product-edit.component';
import { ProductDetailsComponent } from './components/products/product-details/product-details.component';
import { ProductListComponent } from './components/products/product-list/product-list.component';
import { ProductImageListComponent } from './components/productImages/product-image-list/product-image-list.component';
import { ProductImageAddComponent } from './components/productImages/product-image-add/product-image-add.component';
import { ProductImageEditComponent } from './components/productImages/product-image-edit/product-image-edit.component';
import { ProductImageDetailsComponent } from './components/productImages/product-image-details/product-image-details.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminGuard } from './auth/role.guard';
import { EmailConfirmationComponent } from './auth/email-confirmation/email-confirmation.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {path:'login',component:LoginComponent},
  {path:'register',component:RegisterComponent},
  {path:'forgot-Pass',component:ForgotPasswordComponent},
  {path:'reset-password',component:ResetPasswordComponent},
  {path:'email-confirm',component:EmailConfirmationComponent},
  { path: 'categories', component: CategoryListComponent },
  { path: 'categories/add', component: CategoryAddComponent },
  { path: 'categories/edit/:id', component: CategoryEditComponent },
  { path: 'categories/details/:id', component: CategoryDetailsComponent },
  { path: 'products', component:ProductListComponent ,canActivate:[AdminGuard]},
  { path: 'products/add', component: ProductAddComponent ,canActivate:[AdminGuard]},
  { path: 'products/edit/:id', component: ProductEditComponent,canActivate:[AdminGuard] },
  { path: 'products/details/:id', component: ProductDetailsComponent,canActivate:[AdminGuard] },
  { path: 'product-images', component: ProductImageListComponent },
  { path: 'product-images/add', component: ProductImageAddComponent },
  { path: 'product-images/edit/:id', component: ProductImageEditComponent },
  { path: 'product-images/details/:id', component: ProductImageDetailsComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { CatalogComponent } from './features/books/catalog/catalog';
import { DashboardComponent } from './features/admin/dashboard/dashboard';
import { adminGuard } from './core/guards/admin-guard';
import { BookDetailsComponent } from './features/books/book-details/book-details';
import { AddBookComponent } from './features/admin/add-book/add-book';
import { EditBookComponent } from './features/admin/edit-book/edit-book';
import { authGuard } from './core/guards/auth-guard';
import { RoleSelectionComponent } from './features/auth/role-selection/role-selection';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { VerifyCodeComponent } from './features/auth/verify-code/verify-code';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { PasswordChangedComponent } from './features/auth/password-changed/password-changed';
import { RegisterUserComponent } from './features/auth/register-user/register-user';
import { RegisterAdminComponent } from './features/auth/register-admin/register-admin';
import { UserProfileComponent } from './features/profile/user-profile/user-profile';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'books/:id', component: BookDetailsComponent },
  { path: 'admin/dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/books/add', component: AddBookComponent, canActivate: [adminGuard] },
  { path: 'admin/books/:id/edit', component: EditBookComponent, canActivate: [adminGuard] },
  { path: 'about', component: HomeComponent }, 
  { path: 'trending-books', component: HomeComponent },
  { path: 'contact', component: HomeComponent },
  { path: 'auth/select-role', component: RoleSelectionComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-code', component: VerifyCodeComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'password-changed', component: PasswordChangedComponent },
  { path: 'register/user', component: RegisterUserComponent },
  { path: 'register/admin', component: RegisterAdminComponent },
  { path: 'profile', component: UserProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
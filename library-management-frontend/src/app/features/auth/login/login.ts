import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  errorMessage = '';
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get isEmailInvalid(): boolean {
    const control = this.loginForm.get('email');
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  get isPasswordInvalid(): boolean {
    const control = this.loginForm.get('password');
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getEmailErrorMessage(): string {
    const control = this.loginForm.get('email');

    if (!control) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Email is required.';
    }

    if (control.hasError('email')) {
      return 'Please enter a valid email address.';
    }

    return '';
  }

  getPasswordErrorMessage(): string {
    const control = this.loginForm.get('password');

    if (!control) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Password is required.';
    }

    return '';
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {
        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/catalog']);
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Login failed.';
      }
    });
  }
}
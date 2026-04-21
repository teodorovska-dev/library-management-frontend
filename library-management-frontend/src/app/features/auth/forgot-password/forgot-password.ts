import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'],
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get isEmailInvalid(): boolean {
    const control = this.forgotPasswordForm.get('email');
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getEmailErrorMessage(): string {
    const control = this.forgotPasswordForm.get('email');

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

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const email = this.forgotPasswordForm.get('email')?.value?.trim();

    this.isSubmitting = true;

    this.authService.forgotPassword({ email }).subscribe({
      next: (response) => {
        this.successMessage = response.message;

        this.router.navigate(['/verify-code'], {
          queryParams: { email }
        });
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ||
          'Unable to process your request right now. Please try again.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}
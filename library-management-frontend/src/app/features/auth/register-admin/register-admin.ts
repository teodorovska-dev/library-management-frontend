import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './register-admin.html',
  styleUrls: ['./register-admin.scss'],
})
export class RegisterAdminComponent {
  registerForm: FormGroup;
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      adminAccessKey: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [true]
    });
  }

  get isAdminAccessKeyInvalid(): boolean {
    const control = this.registerForm.get('adminAccessKey');
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  get isFirstNameInvalid(): boolean {
    const control = this.registerForm.get('firstName');
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  get isLastNameInvalid(): boolean {
    const control = this.registerForm.get('lastName');
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  get isUsernameInvalid(): boolean {
    const control = this.registerForm.get('username');
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  get isEmailInvalid(): boolean {
    const control = this.registerForm.get('email');
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  get isPasswordInvalid(): boolean {
    const control = this.registerForm.get('password');
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getAdminAccessKeyErrorMessage(): string {
    const control = this.registerForm.get('adminAccessKey');
    if (!control) return '';
    if (control.hasError('backend')) return control.getError('backend');
    if (control.hasError('required')) return 'Admin access key is required.';
    return '';
  }

  getFirstNameErrorMessage(): string {
    const control = this.registerForm.get('firstName');
    if (!control) return '';
    if (control.hasError('backend')) return control.getError('backend');
    if (control.hasError('required')) return 'Name is required.';
    return '';
  }

  getLastNameErrorMessage(): string {
    const control = this.registerForm.get('lastName');
    if (!control) return '';
    if (control.hasError('backend')) return control.getError('backend');
    if (control.hasError('required')) return 'Surname is required.';
    return '';
  }

  getUsernameErrorMessage(): string {
    const control = this.registerForm.get('username');
    if (!control) return '';
    if (control.hasError('backend')) return control.getError('backend');
    if (control.hasError('required')) return 'Username is required.';
    return '';
  }

  getEmailErrorMessage(): string {
    const control = this.registerForm.get('email');
    if (!control) return '';
    if (control.hasError('backend')) return control.getError('backend');
    if (control.hasError('required')) return 'Email is required.';
    if (control.hasError('email')) return 'Please enter a valid email address.';
    return '';
  }

  getPasswordErrorMessage(): string {
    const control = this.registerForm.get('password');
    if (!control) return '';
    if (control.hasError('backend')) return control.getError('backend');
    if (control.hasError('required')) return 'Password is required.';
    if (control.hasError('minlength')) return 'Password must contain at least 8 characters.';
    return '';
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.clearBackendErrors();

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.registerForm.getRawValue();

    this.authService.register({
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      username: formValue.username.trim(),
      email: formValue.email.trim().toLowerCase(),
      password: formValue.password,
      role: 'ADMIN',
      adminAccessKey: formValue.adminAccessKey.trim()
    }, formValue.rememberMe).subscribe({
      next: (response) => {
        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/catalog']);
        }
      },
      error: (err) => {
        const validationErrors = err?.error?.validationErrors;

        if (validationErrors) {
          this.applyBackendValidationErrors(validationErrors);
          this.errorMessage = err?.error?.message || 'Validation error occurred.';
        } else {
          this.errorMessage =
            err?.error?.message ||
            'Unable to complete registration. Please try again.';
        }

        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  private applyBackendValidationErrors(errors: Record<string, string>): void {
    Object.entries(errors).forEach(([field, message]) => {
      const control = this.registerForm.get(field);
      if (control) {
        control.setErrors({ ...(control.errors || {}), backend: message });
        control.markAsTouched();
      }
    });
  }

  private clearBackendErrors(): void {
    ['adminAccessKey', 'firstName', 'lastName', 'username', 'email', 'password'].forEach(field => {
      const control = this.registerForm.get(field);
      if (!control?.errors?.['backend']) {
        return;
      }

      const { backend, ...remainingErrors } = control.errors || {};
      control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
    });
  }
}
import { ChangeDetectorRef, Component } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
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
  isSubmitting = false;
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [true]
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.clearBackendErrors();

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    const formValue = this.loginForm.getRawValue();

    this.authService.login(
      {
        email: formValue.email.trim().toLowerCase(),
        password: formValue.password
      },
      formValue.rememberMe
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/catalog']);
        }
      },
      error: () => {
        this.errorMessage =
          'Invalid email or password. Please check your credentials and try again.';

        this.isSubmitting = false;
        this.loginForm.get('password')?.setErrors({ backend: 'Invalid password.' });
        this.loginForm.get('password')?.markAsTouched();

        this.cdr.detectChanges();
      }
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
    if (!control) return '';

    if (control.hasError('backend')) return control.getError('backend');
    if (control.hasError('required')) return 'Email is required.';
    if (control.hasError('email')) return 'Please enter a valid email address.';

    return '';
  }

  getPasswordErrorMessage(): string {
    const control = this.loginForm.get('password');
    if (!control) return '';

    if (control.hasError('backend')) return control.getError('backend');
    if (control.hasError('required')) return 'Password is required.';

    return '';
  }

  private clearBackendErrors(): void {
    ['email', 'password'].forEach(field => {
      const control = this.loginForm.get(field);

      if (!control?.errors?.['backend']) {
        return;
      }

      const { backend, ...remainingErrors } = control.errors || {};
      control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
    });
  }
}
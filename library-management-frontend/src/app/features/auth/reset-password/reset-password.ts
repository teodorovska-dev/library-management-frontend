import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss'],
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  errorMessage = '';
  isSubmitting = false;

  private email = '';
  private code = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordStrengthValidator()
          ]
        ],
        confirmPassword: ['', [Validators.required]]
      },
      {
        validators: [this.passwordsMatchValidator()]
      }
    );

    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.code = this.route.snapshot.queryParamMap.get('code') || '';
  }

  get isNewPasswordInvalid(): boolean {
    const control = this.resetPasswordForm.get('newPassword');
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  get isConfirmPasswordInvalid(): boolean {
    const control = this.resetPasswordForm.get('confirmPassword');

    if (!control) {
      return false;
    }

    const isControlInvalid = control.invalid && (control.touched || control.dirty);
    const hasMismatch =
      this.resetPasswordForm.hasError('passwordMismatch') &&
      (control.touched || control.dirty);

    return isControlInvalid || hasMismatch;
  }

  getNewPasswordErrorMessage(): string {
    const control = this.resetPasswordForm.get('newPassword');

    if (!control) {
      return '';
    }

    if (control.hasError('required')) {
      return 'New password is required.';
    }

    if (control.hasError('minlength')) {
      return 'Password must contain at least 8 characters.';
    }

    if (control.hasError('passwordStrength')) {
      return 'Use uppercase, lowercase, number, and special character.';
    }

    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    const control = this.resetPasswordForm.get('confirmPassword');

    if (!control) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Please confirm your new password.';
    }

    if (this.resetPasswordForm.hasError('passwordMismatch')) {
      return 'Passwords do not match.';
    }

    return '';
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    if (!this.email || !this.code) {
      this.errorMessage = 'Password reset session is invalid or expired. Please restart the process.';
      return;
    }

    const newPassword = this.resetPasswordForm.get('newPassword')?.value;

    this.isSubmitting = true;

    this.authService.resetPassword({
      email: this.email,
      code: this.code,
      newPassword
    }).subscribe({
      next: () => {
        this.router.navigate(['/password-changed']);
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ||
          'Unable to reset password. Please try again.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  private passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;

      if (!value) {
        return null;
      }

      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[^A-Za-z0-9]/.test(value);

      const isValid = hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

      return isValid ? null : { passwordStrength: true };
    };
  }

  private passwordsMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const newPassword = group.get('newPassword')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;

      if (!newPassword || !confirmPassword) {
        return null;
      }

      return newPassword === confirmPassword ? null : { passwordMismatch: true };
    };
  }
}
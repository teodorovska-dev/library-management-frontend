import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './register-user.html',
  styleUrls: ['./register-user.scss'],
})
export class RegisterUserComponent {
  registerForm: FormGroup;
  errorMessage = '';
  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
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

  getFirstNameErrorMessage(): string {
    const control = this.registerForm.get('firstName');

    if (!control) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Name is required.';
    }

    return '';
  }

  getLastNameErrorMessage(): string {
    const control = this.registerForm.get('lastName');

    if (!control) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Surname is required.';
    }

    return '';
  }

  getUsernameErrorMessage(): string {
    const control = this.registerForm.get('username');

    if (!control) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Username is required.';
    }

    return '';
  }

  getEmailErrorMessage(): string {
    const control = this.registerForm.get('email');

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
    const control = this.registerForm.get('password');

    if (!control) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Password is required.';
    }

    if (control.hasError('minlength')) {
      return 'Password must contain at least 8 characters.';
    }

    return '';
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    setTimeout(() => {
      this.isSubmitting = false;
      console.log('Register user form value:', this.registerForm.getRawValue());
    }, 500);
  }
}
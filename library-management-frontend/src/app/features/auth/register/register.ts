import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  errorMessage = '';
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER', [Validators.required]],
      adminAccessKey: ['']
    });
  }

  get isAdminSelected(): boolean {
    return this.registerForm.get('role')?.value === 'ADMIN';
  }

  onRoleChange(): void {
    const adminAccessKeyControl = this.registerForm.get('adminAccessKey');

    if (this.isAdminSelected) {
      adminAccessKeyControl?.setValidators([Validators.required]);
    } else {
      adminAccessKeyControl?.clearValidators();
      adminAccessKeyControl?.setValue('');
    }

    adminAccessKeyControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authService.register(this.registerForm.getRawValue()).subscribe({
      next: (response) => {
        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/catalog']);
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Registration failed';
      }
    });
  }
}
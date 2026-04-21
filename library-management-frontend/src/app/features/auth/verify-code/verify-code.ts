import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './verify-code.html',
  styleUrls: ['./verify-code.scss'],
})
export class VerifyCodeComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef<HTMLInputElement>>;

  verifyCodeForm: FormGroup;

  errorMessage = '';
  resendMessage = '';

  maskedEmail = '';
  email = '';

  isSubmitting = false;
  isResending = false;

  resendCooldown = 0;
  private resendIntervalId: ReturnType<typeof setInterval> | null = null;

  readonly codeControls = ['digit1', 'digit2', 'digit3', 'digit4'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.verifyCodeForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]]
    });

    const emailFromQuery = this.route.snapshot.queryParamMap.get('email');

    if (emailFromQuery) {
      this.email = emailFromQuery;
      this.maskedEmail = this.maskEmail(emailFromQuery);
    }
  }

  ngAfterViewInit(): void {
    this.focusInput(0);
  }

  ngOnDestroy(): void {
    this.clearCooldownTimer();
  }

  get isCodeInvalid(): boolean {
    return this.verifyCodeForm.invalid &&
      Object.values(this.verifyCodeForm.controls).some(
        control => control.touched || control.dirty
      );
  }

  getCodeErrorMessage(): string {
    return 'Please enter the 4-digit verification code.';
  }

  onCodeInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '').slice(0, 1);

    input.value = value;
    this.verifyCodeForm.get(this.codeControls[index])?.setValue(value);

    if (value && index < this.codeControls.length - 1) {
      this.focusInput(index + 1);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && !input.value && index > 0) {
      this.focusInput(index - 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pastedText =
      event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 4) || '';

    pastedText.split('').forEach((digit, index) => {
      if (this.codeControls[index]) {
        this.verifyCodeForm.get(this.codeControls[index])?.setValue(digit);
      }
    });

    const targetIndex = Math.min(
      pastedText.length,
      this.codeControls.length - 1
    );
    this.focusInput(targetIndex);
  }

  onResendCode(): void {
    this.errorMessage = '';
    this.resendMessage = '';

    if (this.resendCooldown > 0) {
      return;
    }

    if (!this.email) {
      this.errorMessage = 'Email is missing. Please try again.';
      return;
    }

    this.isResending = true;

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (response) => {
        this.resendMessage = response.message;
        this.startCooldown();
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ||
          'Unable to resend the verification code.';
        this.isResending = false;
      },
      complete: () => {
        this.isResending = false;
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.verifyCodeForm.invalid) {
      this.verifyCodeForm.markAllAsTouched();
      return;
    }

    if (!this.email) {
      this.errorMessage = 'Session expired. Please start again.';
      return;
    }

    const code = this.codeControls
      .map(c => this.verifyCodeForm.get(c)?.value)
      .join('');

    this.isSubmitting = true;

    this.authService.verifyResetCode({ email: this.email, code }).subscribe({
      next: () => {
        this.router.navigate(['/reset-password'], {
          queryParams: {
            email: this.email,
            code
          }
        });
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ||
          'Invalid or expired verification code.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  private focusInput(index: number): void {
    const inputs = this.codeInputs.toArray();
    if (inputs[index]) {
      inputs[index].nativeElement.focus();
      inputs[index].nativeElement.select();
    }
  }

  private startCooldown(): void {
    this.clearCooldownTimer();
    this.resendCooldown = 60;

    this.resendIntervalId = setInterval(() => {
      this.resendCooldown--;

      if (this.resendCooldown <= 0) {
        this.clearCooldownTimer();
      }
    }, 1000);
  }

  private clearCooldownTimer(): void {
    if (this.resendIntervalId) {
      clearInterval(this.resendIntervalId);
      this.resendIntervalId = null;
    }
  }

  private maskEmail(email: string): string {
    const [name, domain] = email.split('@');

    if (!name || !domain || name.length < 2) {
      return email;
    }

    return `${name.slice(0, 3)}.....${name.slice(-1)}@${domain}`;
  }
}
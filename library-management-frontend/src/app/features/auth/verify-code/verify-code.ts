import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './verify-code.html',
  styleUrls: ['./verify-code.scss'],
})
export class VerifyCodeComponent {
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef<HTMLInputElement>>;

  verifyCodeForm: FormGroup;
  errorMessage = '';
  resendMessage = '';
  maskedEmail = 'aaa.....t@gmail.com';
  codeControls = ['digit1', 'digit2', 'digit3', 'digit4'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.verifyCodeForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]]
    });

    const emailFromQuery = this.route.snapshot.queryParamMap.get('email');
    if (emailFromQuery) {
      this.maskedEmail = this.maskEmail(emailFromQuery);
    }
  }

  get isCodeInvalid(): boolean {
    return this.verifyCodeForm.invalid &&
      Object.values(this.verifyCodeForm.controls).some(control => control.touched || control.dirty);
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

    const pastedText = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 4) || '';

    pastedText.split('').forEach((digit, index) => {
      if (this.codeControls[index]) {
        this.verifyCodeForm.get(this.codeControls[index])?.setValue(digit);
      }
    });

    const targetIndex = Math.min(pastedText.length, this.codeControls.length - 1);
    this.focusInput(targetIndex);
  }

  onResendCode(): void {
    this.resendMessage = 'A new verification email has been sent.';
    this.errorMessage = '';
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.verifyCodeForm.invalid) {
      this.verifyCodeForm.markAllAsTouched();
      return;
    }

    const code = this.codeControls
      .map(controlName => this.verifyCodeForm.get(controlName)?.value)
      .join('');

    if (code === '2222') {
      this.router.navigate(['/reset-password']);
      return;
    }

    this.errorMessage = 'The verification code is incorrect.';
  }

  private focusInput(index: number): void {
    const inputs = this.codeInputs.toArray();
    if (inputs[index]) {
      inputs[index].nativeElement.focus();
      inputs[index].nativeElement.select();
    }
  }

  private maskEmail(email: string): string {
    const [name, domain] = email.split('@');

    if (!name || !domain || name.length < 2) {
      return email;
    }

    const firstPart = name.slice(0, 3);
    const lastPart = name.slice(-1);

    return `${firstPart}.....${lastPart}@${domain}`;
  }
}
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-changed',
  standalone: true,
  templateUrl: './password-changed.html',
  styleUrls: ['./password-changed.scss'],
})
export class PasswordChangedComponent implements OnInit, OnDestroy {
  isRedirecting = false;
  private redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.redirectTimeoutId = setTimeout(() => {
      this.router.navigate(['/login']);
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.redirectTimeoutId) {
      clearTimeout(this.redirectTimeoutId);
    }
  }

  goToLogin(): void {
    this.isRedirecting = true;

    if (this.redirectTimeoutId) {
      clearTimeout(this.redirectTimeoutId);
    }

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 300);
  }
}
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-changed',
  standalone: true,
  templateUrl: './password-changed.html',
  styleUrls: ['./password-changed.scss'],
})
export class PasswordChangedComponent {
  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
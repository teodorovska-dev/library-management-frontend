import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/layout/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  constructor(public router: Router) {}

  get shouldShowNavbar(): boolean {
    const hiddenRoutes = [
      '/login',
      '/forgot-password',
      '/verify-code',
      '/reset-password',
      '/password-changed',
      '/auth/select-role',
      '/register/user',
      '/register/admin'
    ];

    return !hiddenRoutes.some(route => this.router.url.startsWith(route));
  }
}
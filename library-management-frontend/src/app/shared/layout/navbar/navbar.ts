import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TokenService } from '../../../core/services/token';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent {
  constructor(
    public tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
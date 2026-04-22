import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  templateUrl: './role-selection.html',
  styleUrls: ['./role-selection.scss']
})
export class RoleSelectionComponent {
  constructor(private router: Router) {}

  selectRole(role: 'USER' | 'ADMIN'): void {
    if (role === 'USER') {
      this.router.navigate(['/register/user']);
      return;
    }

    this.router.navigate(['/register/admin']);
  }
}
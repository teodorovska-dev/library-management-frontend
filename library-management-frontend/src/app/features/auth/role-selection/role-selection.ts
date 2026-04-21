import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  templateUrl: './role-selection.html',
  styleUrl: './role-selection.scss'
})
export class RoleSelectionComponent {
  constructor(private router: Router) {}

  selectRole(role: 'USER' | 'ADMIN'): void {
    this.router.navigate(['/register'], {
      queryParams: { role }
    });
  }
}
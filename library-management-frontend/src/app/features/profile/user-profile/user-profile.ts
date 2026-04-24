import { Component } from '@angular/core';
import { NgFor, NgIf, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

type ProfileModalType = 'success' | 'validation-error' | 'logout-confirm' | null;
type DashboardTrend = 'increase' | 'decrease' | 'neutral';

interface FavoriteBook {
  id: number;
  title: string;
  author: string;
  year: number;
  status: string;
  coverUrl: string;
  splashUrl: string;
}

interface DashboardStat {
  label: string;
  value: number;
  trend: DashboardTrend;
  change?: number;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss'],
})
export class UserProfileComponent {
  isAdmin = true;
  isEditing = false;
  isSaving = false;

  activeModal: ProfileModalType = null;

  avatarPreviewUrl = 'assets/images/profile/user-icon.svg';
  selectedAvatarName = '';

  profileForm: FormGroup;

  dashboardStats: DashboardStat[] = [
    { label: 'Total books', value: 1000, trend: 'increase', change: 12 },
    { label: 'Total titles', value: 1000, trend: 'neutral' },
    { label: 'Total authors', value: 1000, trend: 'increase', change: 8 },
    { label: 'Written-off books', value: 1000, trend: 'decrease', change: 4 },
    { label: 'Available copies', value: 1000, trend: 'increase', change: 10 },
  ];

  favoriteBooks: FavoriteBook[] = [
    {
      id: 1,
      title: 'THE PSYCHOLOGY OF MONEY',
      author: 'Morgan Housel',
      year: 2020,
      status: 'Available',
      coverUrl: 'assets/images/books/psychology-of-money.png',
      splashUrl: 'assets/images/profile/splash-green.svg',
    },
    {
      id: 2,
      title: 'IT ENDS WITH US',
      author: 'Colleen Hoover',
      year: 2020,
      status: 'Available',
      coverUrl: 'assets/images/books/it-ends-with-us.png',
      splashUrl: 'assets/images/profile/splash-pink.svg',
    },
    {
      id: 3,
      title: 'THE SUBTLE ART OF NOT GIVING A F*CK',
      author: 'Mark Manson',
      year: 2020,
      status: 'Available',
      coverUrl: 'assets/images/books/subtle-art.png',
      splashUrl: 'assets/images/profile/splash-orange.svg',
    },
    {
      id: 4,
      title: 'A GOOD GIRL’S GUIDE TO MURDER',
      author: 'Holly Jackson',
      year: 2020,
      status: 'Available',
      coverUrl: 'assets/images/books/good-girls-guide.png',
      splashUrl: 'assets/images/profile/splash-white.svg',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['Anastasiia', [Validators.required, Validators.maxLength(60)]],
      lastName: ['Teodorovska', [Validators.required, Validators.maxLength(60)]],
      email: ['anastasiia.teodorovska@gmail.com', [Validators.required, Validators.email]],
      status: [this.isAdmin ? 'Administrator' : 'User', [Validators.required]],
      avatar: [null],
    });

    this.profileForm.disable();
  }

  get fullName(): string {
    const firstName = this.profileForm.get('firstName')?.value || '';
    const lastName = this.profileForm.get('lastName')?.value || '';

    return `${firstName} ${lastName}`.trim().toUpperCase();
  }

  get isFirstNameInvalid(): boolean {
    const control = this.profileForm.get('firstName');
    return !!control && control.invalid && control.touched;
  }

  get isLastNameInvalid(): boolean {
    const control = this.profileForm.get('lastName');
    return !!control && control.invalid && control.touched;
  }

  get isEmailInvalid(): boolean {
    const control = this.profileForm.get('email');
    return !!control && control.invalid && control.touched;
  }

  get isStatusInvalid(): boolean {
    const control = this.profileForm.get('status');
    return !!control && control.invalid && control.touched;
  }

  onEditProfile(): void {
    this.isEditing = true;
    this.profileForm.enable();
    this.profileForm.get('status')?.disable();
  }

  onAvatarSelected(event: Event): void {
    if (!this.isEditing) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.selectedAvatarName = file.name;
    this.profileForm.patchValue({ avatar: file });

    const reader = new FileReader();

    reader.onload = () => {
      this.avatarPreviewUrl = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  onSaveChanges(): void {
    if (!this.isEditing) {
      return;
    }

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.openModal('validation-error');
      return;
    }

    this.isSaving = true;

    console.log('Updated profile data:', this.profileForm.getRawValue());

    setTimeout(() => {
      this.isSaving = false;
      this.isEditing = false;
      this.profileForm.disable();
      this.openModal('success');
    }, 600);
  }

  onLogout(): void {
    this.openModal('logout-confirm');
  }

  confirmLogout(): void {
    this.closeModal();

    localStorage.removeItem('token');
    localStorage.removeItem('role');

    this.router.navigate(['/login']);
  }

  openModal(type: ProfileModalType): void {
    this.activeModal = type;
  }

  closeModal(): void {
    this.activeModal = null;
  }
}
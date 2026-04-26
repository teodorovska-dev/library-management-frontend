import { ChangeDetectorRef, Component } from '@angular/core';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TokenService } from '../../../core/services/token';
import { FavoritesService } from '../../../core/services/favorites';
import { Book } from '../../../core/models/book.model';
import { DashboardService, AdminDashboardStats } from '../../../core/services/dashboard';
import { UserProfileService } from '../../../core/services/user-profile';

type ProfileModalType = 'success' | 'validation-error' | 'logout-confirm' | null;
type DashboardTrend = 'increase' | 'decrease' | 'neutral';

interface FavoriteBook {
  id: number;
  title: string;
  author: string;
  year: number;
  status: string;
  coverUrl: string;
  splashColor: string;
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
  styleUrls: ['./user-profile.scss']
})
export class UserProfileComponent {
  isAdmin = false;
  isEditing = false;
  isSaving = false;

  activeModal: ProfileModalType = null;

  avatarPreviewUrl = 'assets/images/profile/user-icon.svg';
  selectedAvatarName = '';
  selectedAvatarFile: File | null = null;

  profileErrorMessage = '';

  profileForm: FormGroup;

  dashboardStats: DashboardStat[] = [];
  favoriteBooks: FavoriteBook[] = [];

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private tokenService: TokenService,
    private favoritesService: FavoritesService,
    private dashboardService: DashboardService,
    private userProfileService: UserProfileService,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(60)]],
      lastName: ['', [Validators.required, Validators.maxLength(60)]],
      email: ['', [Validators.required, Validators.email]],
      status: ['', [Validators.required]],
      avatar: [null]
    });

    this.initializeProfile();
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

  private initializeProfile(): void {
    this.userProfileService.getCurrentProfile().subscribe({
      next: user => {
        this.isAdmin = user.role === 'ADMIN';

        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          status: this.isAdmin ? 'Administrator' : 'User'
        });

        this.avatarPreviewUrl = this.resolveAvatarUrl(user.avatarUrl);

        this.tokenService.updateUserData({
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        });

        this.syncProfileData();
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load profile:', error);
        this.initializeProfileFromTokenFallback();
      }
    });
  }

  private initializeProfileFromTokenFallback(): void {
    const user = this.tokenService.getUser();

    this.isAdmin = user?.role === 'ADMIN';

    const fullName = user?.fullName || '';
    const nameParts = fullName.trim().split(' ').filter(Boolean);

    this.profileForm.patchValue({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user?.email || '',
      status: this.isAdmin ? 'Administrator' : 'User'
    });

    this.syncProfileData();
    this.cdr.detectChanges();
  }

  private syncProfileData(): void {
    if (this.isAdmin) {
      this.loadDashboardStats();
    } else {
      this.loadFavorites();
    }
  }

  private loadFavorites(): void {
    if (this.isAdmin) {
      this.favoriteBooks = [];
      this.cdr.detectChanges();
      return;
    }

    this.favoritesService.getFavorites().subscribe({
      next: books => {
        this.favoriteBooks = books.map(book => this.mapBookToFavoriteBook(book));
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load favorite books:', error);
        this.favoriteBooks = [];
        this.cdr.detectChanges();
      }
    });
  }

  private mapBookToFavoriteBook(book: Book): FavoriteBook {
    return {
      id: book.id,
      title: book.title,
      author: book.authorFullName,
      year: book.publicationYear,
      status: book.status === 'AVAILABLE' ? 'Available' : 'Not available',
      coverUrl: this.resolveCoverUrl(book.coverImageUrl),
      splashColor: book.splashColor || '#d8ddd2'
    };
  }

  private resolveCoverUrl(coverImageUrl?: string): string {
    if (!coverImageUrl || coverImageUrl.includes('example.com')) {
      return 'assets/images/books/book-details-cover.png';
    }

    if (coverImageUrl.startsWith('/uploads')) {
      return `http://localhost:8082${coverImageUrl}`;
    }

    return coverImageUrl;
  }

  private getSplashUrl(genre?: string): string {
    const normalizedGenre = genre?.toLowerCase() ?? '';

    if (normalizedGenre.includes('romance')) {
      return 'assets/images/profile/splash-pink.svg';
    }

    if (normalizedGenre.includes('finance') || normalizedGenre.includes('psychology')) {
      return 'assets/images/profile/splash-green.svg';
    }

    if (normalizedGenre.includes('mystery') || normalizedGenre.includes('classic')) {
      return 'assets/images/profile/splash-white.svg';
    }

    return 'assets/images/profile/splash-orange.svg';
  }

  private loadDashboardStats(): void {
    this.dashboardService.getStats().subscribe({
      next: stats => {
        this.dashboardStats = this.mapDashboardStats(stats);
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load dashboard stats:', error);
        this.cdr.detectChanges();
      }
    });
  }

  private mapDashboardStats(stats: AdminDashboardStats): DashboardStat[] {
    return [
      {
        label: 'Total books',
        value: stats.totalBooks.value,
        trend: stats.totalBooks.trend,
        change: stats.totalBooks.change
      },
      {
        label: 'Total titles',
        value: stats.totalTitles.value,
        trend: stats.totalTitles.trend,
        change: stats.totalTitles.change
      },
      {
        label: 'Total authors',
        value: stats.totalAuthors.value,
        trend: stats.totalAuthors.trend,
        change: stats.totalAuthors.change
      },
      {
        label: 'Written-off books',
        value: stats.writtenOffBooks.value,
        trend: stats.writtenOffBooks.trend,
        change: stats.writtenOffBooks.change
      },
      {
        label: 'Available copies',
        value: stats.availableCopies.value,
        trend: stats.availableCopies.trend,
        change: stats.availableCopies.change
      }
    ];
  }

  onOpenFavoriteBook(bookId: number): void {
    this.router.navigate(['/books', bookId]);
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

    this.selectedAvatarFile = file;
    this.selectedAvatarName = file.name;
    this.profileForm.patchValue({ avatar: file });

    const reader = new FileReader();

    reader.onload = () => {
      this.avatarPreviewUrl = reader.result as string;
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  }

  onSaveChanges(): void {
    if (!this.isEditing) {
      return;
    }

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.profileErrorMessage = 'Please fill in required fields correctly.';
      this.openModal('validation-error');
      return;
    }

    this.isSaving = true;
    this.profileErrorMessage = '';

    const payload = {
      firstName: this.profileForm.get('firstName')?.value.trim(),
      lastName: this.profileForm.get('lastName')?.value.trim(),
      email: this.profileForm.get('email')?.value.trim()
    };

    this.userProfileService.updateCurrentProfile(payload).subscribe({
      next: user => {
        if (this.selectedAvatarFile) {
          this.uploadAvatarAfterProfileSave();
          return;
        }

        this.finishSuccessfulProfileSave(user);
      },
      error: error => {
        console.error('Failed to update profile:', error);
        this.isSaving = false;
        this.profileErrorMessage =
          error?.error?.message || 'Failed to update profile. Please try again.';
        this.openModal('validation-error');
        this.cdr.detectChanges();
      }
    });
  }

  private uploadAvatarAfterProfileSave(): void {
    if (!this.selectedAvatarFile) {
      return;
    }

    this.userProfileService.uploadAvatar(this.selectedAvatarFile).subscribe({
      next: user => {
        this.finishSuccessfulProfileSave(user);
      },
      error: error => {
        console.error('Failed to upload avatar:', error);
        this.isSaving = false;
        this.profileErrorMessage = 'Profile was updated, but avatar upload failed.';
        this.openModal('validation-error');
        this.cdr.detectChanges();
      }
    });
  }

  private finishSuccessfulProfileSave(user: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    role: string;
    userId: number;
    avatarUrl?: string;
  }): void {
    this.tokenService.updateUserData({
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    });

    this.isAdmin = user.role === 'ADMIN';

    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: this.isAdmin ? 'Administrator' : 'User'
    });

    this.avatarPreviewUrl = this.resolveAvatarUrl(user.avatarUrl);
    this.selectedAvatarFile = null;
    this.selectedAvatarName = '';

    this.isSaving = false;
    this.isEditing = false;
    this.profileForm.disable();

    this.openModal('success');
    this.syncProfileData();
    this.cdr.detectChanges();
  }

  private resolveAvatarUrl(avatarUrl?: string): string {
    if (!avatarUrl) {
      return 'assets/images/profile/user-icon.svg';
    }

    if (avatarUrl.startsWith('/uploads')) {
      return `http://localhost:8082${avatarUrl}`;
    }

    return avatarUrl;
  }

  onLogout(): void {
    this.openModal('logout-confirm');
  }

  confirmLogout(): void {
    this.closeModal();
    this.tokenService.clear();
    this.router.navigate(['/login']);
  }

  openModal(type: ProfileModalType): void {
    this.activeModal = type;
  }

  closeModal(): void {
    this.activeModal = null;
  }
}
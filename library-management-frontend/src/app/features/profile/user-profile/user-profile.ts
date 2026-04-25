import { ChangeDetectorRef, Component } from '@angular/core';
import { NgFor, NgIf, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TokenService } from '../../../core/services/token';
import { FavoritesService } from '../../../core/services/favorites';
import { Book } from '../../../core/models/book.model';
import { DashboardService, AdminDashboardStats } from '../../../core/services/dashboard';

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
  isAdmin = false;
  isEditing = false;
  isSaving = false;

  activeModal: ProfileModalType = null;

  avatarPreviewUrl = 'assets/images/profile/user-icon.svg';
  selectedAvatarName = '';

  profileForm: FormGroup;

  dashboardStats: DashboardStat[] = [];
  favoriteBooks: FavoriteBook[] = [];

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private tokenService: TokenService,
    private favoritesService: FavoritesService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(60)]],
      lastName: ['', [Validators.required, Validators.maxLength(60)]],
      email: ['', [Validators.required, Validators.email]],
      status: ['', [Validators.required]],
      avatar: [null],
    });

    this.initializeProfile();
    this.profileForm.disable();

    if (this.isAdmin) {
      this.loadDashboardStats();
    } else {
      this.loadFavorites();
    }
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
    const user = this.tokenService.getUser();

    this.isAdmin = user?.role === 'ADMIN';

    const fullName = user?.fullName || '';
    const nameParts = fullName.trim().split(' ').filter(Boolean);

    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    this.profileForm.patchValue({
      firstName,
      lastName,
      email: user?.email || '',
      status: this.isAdmin ? 'Administrator' : 'User'
    });
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
      splashUrl: this.getSplashUrl(book.genre)
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
      { label: 'Total books', value: stats.totalBooks, trend: 'neutral' },
      { label: 'Total titles', value: stats.totalTitles, trend: 'neutral' },
      { label: 'Total authors', value: stats.totalAuthors, trend: 'neutral' },
      { label: 'Written-off books', value: stats.writtenOffBooks, trend: 'neutral' },
      { label: 'Available copies', value: stats.availableCopies, trend: 'neutral' },
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
      this.openModal('validation-error');
      return;
    }

    this.isSaving = true;

    setTimeout(() => {
      this.isSaving = false;
      this.isEditing = false;
      this.profileForm.disable();
      this.openModal('success');
      this.cdr.detectChanges();
    }, 600);
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
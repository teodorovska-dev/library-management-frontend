import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

type UserRole = 'guest' | 'user' | 'admin';
type BookDetailsModalType = 'delete-confirm' | null;

interface BookDetailsViewModel {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  publisher: string;
  editors: string;
  format: string;
  features: string;
  languages: string[];
  categories: string[];
  publicationYear: number;
  availableCopies: number;
  isbn: string;
  status: string;
  breadcrumbTitle: string;
}

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterLink],
  templateUrl: './book-details.html',
  styleUrls: ['./book-details.scss']
})
export class BookDetailsComponent {
  readonly currentRole = signal<UserRole>('guest');
  readonly isSavedToFavorites = signal<boolean>(false);
  readonly activeModal = signal<BookDetailsModalType>(null);

  readonly book = signal<BookDetailsViewModel>({
    id: 1,
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    description:
      'The Psychology of Money by Morgan Housel explores how our thoughts, emotions, and habits shape financial decisions. Instead of complex theories, the book shows that success with money depends on behavior, patience, and consistency.\n\nThrough simple insights and real-life examples, it highlights key ideas like long-term thinking, the power of compounding, and the importance of financial independence, helping readers build a healthier relationship with money.',
    coverImage: 'assets/images/books/book-details-cover.png',
    publisher: 'Harriman House',
    editors: 'Not applicable',
    format: '21.6 × 13.8 × 2.0 cm',
    features: 'Full color, 252 pages',
    languages: ['English'],
    categories: ['Psychology', 'Finance'],
    publicationYear: 2020,
    availableCopies: 12,
    isbn: '978-0857197689',
    status: 'Available',
    breadcrumbTitle: 'Book Details'
  });

  readonly isGuest = computed(() => this.currentRole() === 'guest');
  readonly isUser = computed(() => this.currentRole() === 'user');
  readonly isAdmin = computed(() => this.currentRole() === 'admin');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.initializeRole();
    this.initializeMockBook();
  }

  private initializeRole(): void {
    const roleFromQuery = this.route.snapshot.queryParamMap.get('role');

    if (roleFromQuery === 'user' || roleFromQuery === 'admin' || roleFromQuery === 'guest') {
      this.currentRole.set(roleFromQuery);
      return;
    }

    this.currentRole.set('guest');
  }

  private initializeMockBook(): void {
    const bookId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isNaN(bookId) && bookId > 0) {
      this.book.update(current => ({
        ...current,
        id: bookId
      }));
    }
  }

  onToggleFavorite(): void {
    if (!this.isUser()) {
      return;
    }

    this.isSavedToFavorites.set(!this.isSavedToFavorites());
  }

  onEditBook(): void {
    if (!this.isAdmin()) {
      return;
    }

    this.router.navigate(['/admin/books', this.book().id, 'edit']);
  }

  onDeleteBook(): void {
    if (!this.isAdmin()) {
      return;
    }

    this.activeModal.set('delete-confirm');
  }

  closeModal(): void {
    this.activeModal.set(null);
  }

  confirmDeleteBook(): void {
    console.log('Book deleted:', this.book().id);

    this.activeModal.set(null);
    this.router.navigate(['/catalog']);
  }

  onBackToCatalog(): void {
    this.router.navigate(['/catalog']);
  }

  onScrollToDetails(): void {
    const target = document.getElementById('about-book-section');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  getLanguageLabel(): string {
    return this.book().languages.join(', ');
  }

  getCategoryLabel(): string {
    return this.book().categories.join(' / ');
  }
}
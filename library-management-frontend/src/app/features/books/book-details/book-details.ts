import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TokenService } from '../../../core/services/token';
import { BooksService } from '../../../core/services/books';
import { Book } from '../../../core/models/book.model';
import { FavoritesService } from '../../../core/services/favorites';


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
  splashColor: string;
}

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterLink],
  templateUrl: './book-details.html',
  styleUrls: ['./book-details.scss']
})
export class BookDetailsComponent {
  readonly isSavedToFavorites = signal<boolean>(false);
  readonly activeModal = signal<BookDetailsModalType>(null);
  readonly isLoading = signal<boolean>(false);
  readonly hasError = signal<boolean>(false);

  readonly book = signal<BookDetailsViewModel>({
    id: 0,
    title: '',
    author: '',
    description: 'No description is available for this book.',
    coverImage: 'assets/images/books/book-details-cover.png',
    publisher: 'Not specified',
    editors: 'Not specified',
    format: 'Not specified',
    features: 'Not specified',
    languages: [],
    categories: [],
    publicationYear: 0,
    availableCopies: 0,
    isbn: 'Not specified',
    status: 'Not available',
    breadcrumbTitle: 'Book Details',
    splashColor: '#d8ddd2',
  });

  readonly isGuest = computed(() => !this.tokenService.isLoggedIn());
  readonly isUser = computed(() => this.tokenService.getUserRole() === 'USER');
  readonly isAdmin = computed(() => this.tokenService.getUserRole() === 'ADMIN');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tokenService: TokenService,
    private readonly booksService: BooksService,
    private readonly favoritesService: FavoritesService
  ) {
    this.loadBook();
  }

  private loadBook(): void {
    const bookId = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isNaN(bookId) || bookId <= 0) {
      this.hasError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.booksService.getBookById(bookId).subscribe({
      next: book => {
        this.book.set(this.mapBookToViewModel(book));
        if (this.isUser()) {
          this.loadFavoriteStatus(book.id);
        }
        this.isLoading.set(false);
      },
      error: error => {
        console.error('Failed to load book details:', error);
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  private mapBookToViewModel(book: Book): BookDetailsViewModel {
    return {
      id: book.id,
      title: book.title,
      author: book.authorFullName,
      description: book.description || 'No description is available for this book.',
      coverImage: this.resolveCoverUrl(book.coverImageUrl),
      publisher: book.publisher || 'Not specified',
      editors: 'Not specified',
      format: 'Printed book',
      features: `${book.copiesCount} copies in library`,
      languages: book.language ? [book.language] : ['Unknown'],
      categories: book.genre ? [book.genre] : ['General'],
      publicationYear: book.publicationYear,
      availableCopies: book.status === 'AVAILABLE' ? book.copiesCount : 0,
      isbn: book.isbn || 'Not specified',
      status: this.mapStatus(book.status),
      breadcrumbTitle: book.title,
      splashColor: book.splashColor || '#d8ddd2',
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

  onCoverError(): void {
    this.book.update(current => ({
      ...current,
      coverImage: 'assets/images/books/book-details-cover.png'
    }));
  }

  private mapStatus(status: string): string {
    if (status === 'AVAILABLE') {
      return 'Available';
    }

    if (status === 'OUT_OF_STOCK') {
      return 'Not available';
    }

    return 'Written off';
  }

onToggleFavorite(): void {
  if (!this.isUser()) {
    return;
  }

  const bookId = this.book().id;

  if (this.isSavedToFavorites()) {
    this.favoritesService.removeFromFavorites(bookId).subscribe({
      next: () => this.isSavedToFavorites.set(false),
      error: error => console.error('Failed to remove favorite:', error)
    });

    return;
  }

  this.favoritesService.addToFavorites(bookId).subscribe({
    next: () => this.isSavedToFavorites.set(true),
    error: error => console.error('Failed to add favorite:', error)
  });
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
    if (!this.isAdmin()) {
      return;
    }

    this.booksService.writeOffBook(this.book().id).subscribe({
      next: () => {
        this.activeModal.set(null);
        this.router.navigate(['/catalog']);
      },
      error: error => {
        console.error('Failed to write off book:', error);
        this.activeModal.set(null);
      }
    });
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

  private loadFavoriteStatus(bookId: number): void {
  if (!this.isUser()) {
    return;
  }

  this.favoritesService.isFavorite(bookId).subscribe({
    next: response => this.isSavedToFavorites.set(response.favorite),
    error: error => console.error('Failed to load favorite status:', error)
  });
}
}
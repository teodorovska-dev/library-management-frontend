import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TokenService } from '../../../core/services/token';
import { BooksService } from '../../../core/services/books';
import { Book } from '../../../core/models/book.model';

type SortField = 'year' | 'author' | 'title';
type SortDirection = 'asc' | 'desc';

interface CatalogBook {
  id: number;
  title: string;
  author: string;
  year: number;
  status: 'Available' | 'Not available';
  category: string;
  language: string;
  coverUrl: string;
  splashUrl: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss'
})
export class CatalogComponent implements OnInit, OnDestroy {
  searchKeyword = '';
  languageSearchKeyword = '';

  isSortModalOpen = false;
  isFilterModalOpen = false;
  isLanguageModalOpen = false;

  activeSortField: SortField | null = null;
  activeSortDirection: SortDirection | null = null;

  selectedCategories: string[] = [];
  selectedAvailability: string | null = null;
  selectedLanguages: string[] = [];

  readonly booksPerLoad = 12;

  currentPage = 0;
  isLastPage = false;
  isLoading = false;

  books: CatalogBook[] = [];
  filteredBooks: CatalogBook[] = [];

  categories: string[] = [];
  languages: string[] = [];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    public tokenService: TokenService,
    private router: Router,
    private booksService: BooksService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCatalogDictionaries();
    this.initSearch();
    this.loadBooks(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isAdmin(): boolean {
    return this.tokenService.getUserRole() === 'ADMIN';
  }

  get visibleBooks(): CatalogBook[] {
    return this.filteredBooks;
  }

  get canLoadMore(): boolean {
    return !this.isLastPage && this.filteredBooks.length > 0 && !this.isLoading;
  }

  get showEmptyState(): boolean {
    return !this.isLoading && this.filteredBooks.length === 0;
  }

  get filteredLanguages(): string[] {
    const query = this.languageSearchKeyword.trim().toLowerCase();

    if (!query) {
      return this.languages;
    }

    return this.languages.filter(language =>
      language.toLowerCase().includes(query)
    );
  }

  onSearchChange(value: string): void {
    this.searchKeyword = value;
    this.searchSubject.next(value);
  }

  loadMoreBooks(): void {
    if (!this.isLastPage && !this.isLoading) {
      this.loadBooks(false);
    }
  }

  private initSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadBooks(true);
      });
  }

  private loadCatalogDictionaries(): void {
    this.booksService.getAvailableGenres()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: genres => {
          this.categories = genres;
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Failed to load genres:', error);
          this.categories = [];
        }
      });

    this.booksService.getAvailableLanguages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: languages => {
          this.languages = languages;
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Failed to load languages:', error);
          this.languages = [];
        }
      });
  }

  private loadBooks(reset: boolean): void {
    if (this.isLoading) {
      return;
    }

    if (reset) {
      this.currentPage = 0;
      this.isLastPage = false;
      this.books = [];
      this.filteredBooks = [];
    }

    this.isLoading = true;

    this.booksService.filterBooks(
      {
        keyword: this.searchKeyword,
        genres: this.selectedCategories,
        languages: this.selectedLanguages,
        status: this.mapAvailabilityToBackendStatus()
      },
      this.currentPage,
      this.booksPerLoad,
      this.activeSortField ?? 'title',
      this.activeSortDirection ?? 'asc'
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          const mappedBooks = response.content.map((book: Book) =>
            this.mapBookToCatalogBook(book)
          );

          this.books = reset ? mappedBooks : [...this.books, ...mappedBooks];
          this.filteredBooks = [...this.books];

          this.isLastPage = response.last;
          this.currentPage = response.page + 1;
          this.isLoading = false;

          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Failed to load catalog books:', error);

          this.books = [];
          this.filteredBooks = [];
          this.isLastPage = true;
          this.isLoading = false;

          this.cdr.detectChanges();
        }
      });
  }

  private mapBookToCatalogBook(book: Book): CatalogBook {
    return {
      id: book.id,
      title: book.title,
      author: `${book.authorSurname} ${book.authorInitials}`,
      year: book.publicationYear,
      status: book.status === 'AVAILABLE' ? 'Available' : 'Not available',
      category: book.genre || 'General',
      language: book.language || 'Unknown',
      coverUrl: this.resolveCoverUrl(book.coverImageUrl),
      splashUrl: this.getSplashUrl(book.genre)
    };
  }

  private resolveCoverUrl(coverImageUrl?: string): string {
    if (!coverImageUrl || coverImageUrl.includes('example.com')) {
      return 'assets/images/catalog/book-psychology-money.png';
    }

    return coverImageUrl;
  }

  onCoverError(book: CatalogBook): void {
    book.coverUrl = 'assets/images/catalog/book-psychology-money.png';
  }

  private mapAvailabilityToBackendStatus(): string | null {
    if (this.selectedAvailability === 'Available') {
      return 'AVAILABLE';
    }

    if (this.selectedAvailability === 'Not available') {
      return 'OUT_OF_STOCK';
    }

    return null;
  }

  private getSplashUrl(genre?: string): string {
    const normalizedGenre = genre?.toLowerCase() ?? '';

    if (normalizedGenre.includes('romance')) {
      return 'assets/images/catalog/splash-pink.svg';
    }

    if (normalizedGenre.includes('psychology') || normalizedGenre.includes('biography')) {
      return 'assets/images/catalog/splash-green.svg';
    }

    if (normalizedGenre.includes('mystery') || normalizedGenre.includes('classic')) {
      return 'assets/images/catalog/splash-white.svg';
    }

    return 'assets/images/catalog/splash-orange.svg';
  }

  openSortModal(): void {
    this.isSortModalOpen = true;
  }

  closeSortModal(): void {
    this.isSortModalOpen = false;
  }

  selectSort(field: SortField, direction: SortDirection): void {
    this.activeSortField = field;
    this.activeSortDirection = direction;
  }

  resetSort(): void {
    this.activeSortField = null;
    this.activeSortDirection = null;
    this.loadBooks(true);
    this.closeSortModal();
  }

  applySort(): void {
    this.loadBooks(true);
    this.closeSortModal();
  }

  openFilterModal(): void {
    this.isFilterModalOpen = true;
  }

  closeFilterModal(): void {
    this.isFilterModalOpen = false;
  }

  openLanguageModal(): void {
    this.isLanguageModalOpen = true;
  }

  closeLanguageModal(): void {
    this.isLanguageModalOpen = false;
  }

  toggleCategory(category: string): void {
    this.selectedCategories = this.selectedCategories.includes(category)
      ? this.selectedCategories.filter(item => item !== category)
      : [...this.selectedCategories, category];
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  selectAvailability(status: string): void {
    this.selectedAvailability = this.selectedAvailability === status ? null : status;
  }

  toggleLanguage(language: string): void {
    this.selectedLanguages = this.selectedLanguages.includes(language)
      ? this.selectedLanguages.filter(item => item !== language)
      : [...this.selectedLanguages, language];
  }

  isLanguageSelected(language: string): boolean {
    return this.selectedLanguages.includes(language);
  }

  resetLanguages(): void {
    this.selectedLanguages = [];
    this.languageSearchKeyword = '';
  }

  resetFilters(): void {
    this.selectedCategories = [];
    this.selectedAvailability = null;
    this.selectedLanguages = [];
    this.languageSearchKeyword = '';
    this.searchKeyword = '';

    this.loadBooks(true);
    this.closeFilterModal();
  }

  applyFilters(): void {
    this.loadBooks(true);
    this.closeFilterModal();
  }

  applyLanguages(): void {
    this.loadBooks(true);
    this.closeLanguageModal();
  }

  openDetails(bookId: number): void {
    this.router.navigate(['/books', bookId]);
  }

  goToAddBook(): void {
    this.router.navigate(['/admin/add-book']);
  }
}
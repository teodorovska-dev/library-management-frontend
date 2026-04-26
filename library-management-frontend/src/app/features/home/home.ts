import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BooksService } from '../../core/services/books';
import { Book } from '../../core/models/book.model';

interface TrendingBook {
  id: number;
  title: string;
  author: string;
  year: number;
  status: string;
  coverUrl: string;
  splashColor: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  trendingBooks = signal<TrendingBook[]>([]);

  readonly booksPerPage = 4;

  currentTrendingPage = signal(0);
  totalTrendingPages = signal(0);

  isTrendingLoading = false;
  hasTrendingError = false;

  constructor(
    private booksService: BooksService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTrendingBooks(0);
  }

  get canSlide(): boolean {
    return this.totalTrendingPages() > 1;
  }

  nextSlide(): void {
    if (!this.canSlide || this.isTrendingLoading) {
      return;
    }

    const nextPage =
      this.currentTrendingPage() + 1 >= this.totalTrendingPages()
        ? 0
        : this.currentTrendingPage() + 1;

    this.loadTrendingBooks(nextPage);
  }

  prevSlide(): void {
    if (!this.canSlide || this.isTrendingLoading) {
      return;
    }

    const previousPage =
      this.currentTrendingPage() - 1 < 0
        ? this.totalTrendingPages() - 1
        : this.currentTrendingPage() - 1;

    this.loadTrendingBooks(previousPage);
  }

  openBookDetails(bookId: number): void {
    this.router.navigate(['/books', bookId]);
  }

  onCoverError(book: TrendingBook): void {
    book.coverUrl = 'assets/images/books/book-details-cover.png';
  }

  private loadTrendingBooks(page: number): void {
    this.isTrendingLoading = true;
    this.hasTrendingError = false;

    this.booksService.getTrendingBooks(page, this.booksPerPage).subscribe({
      next: response => {
        this.trendingBooks.set(
          response.content.map(book => this.mapBookToTrendingBook(book))
        );

        this.currentTrendingPage.set(response.page);
        this.totalTrendingPages.set(response.totalPages);

        this.isTrendingLoading = false;
      },
      error: error => {
        console.error('Failed to load trending books:', error);

        this.trendingBooks.set([]);
        this.currentTrendingPage.set(0);
        this.totalTrendingPages.set(0);

        this.isTrendingLoading = false;
        this.hasTrendingError = true;
      }
    });
  }

  private mapBookToTrendingBook(book: Book): TrendingBook {
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

}
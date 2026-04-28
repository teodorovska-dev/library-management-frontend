import { Component, OnInit, computed, signal } from '@angular/core';
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

  readonly visibleTrendingCount = 4;
  readonly trendingFetchLimit = 20;

  currentTrendingIndex = signal(0);

  visibleTrendingBooks = computed(() => {
    const start = this.currentTrendingIndex();
    return this.trendingBooks().slice(start, start + this.visibleTrendingCount);
  });

  totalTrendingSteps = computed(() => {
    return Math.max(
      this.trendingBooks().length - this.visibleTrendingCount + 1,
      1
    );
  });

  isTrendingLoading = false;
  hasTrendingError = false;

  constructor(
    private booksService: BooksService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTrendingBooks();
  }

  get canSlide(): boolean {
    return this.trendingBooks().length > this.visibleTrendingCount;
  }

  nextSlide(): void {
    if (!this.canSlide || this.isTrendingLoading) {
      return;
    }

    this.currentTrendingIndex.update(index =>
      index + 1 >= this.totalTrendingSteps() ? 0 : index + 1
    );
  }

  prevSlide(): void {
    if (!this.canSlide || this.isTrendingLoading) {
      return;
    }

    this.currentTrendingIndex.update(index =>
      index - 1 < 0 ? this.totalTrendingSteps() - 1 : index - 1
    );
  }

  openBookDetails(bookId: number): void {
    this.router.navigate(['/books', bookId]);
  }

  onCoverError(book: TrendingBook): void {
    book.coverUrl = 'assets/images/books/book-details-cover.png';
  }

  private loadTrendingBooks(): void {
    this.isTrendingLoading = true;
    this.hasTrendingError = false;

    this.booksService.getTrendingBooks(0, this.trendingFetchLimit).subscribe({
      next: response => {
        this.trendingBooks.set(
          response.content.map(book => this.mapBookToTrendingBook(book))
        );

        this.currentTrendingIndex.set(0);
        this.isTrendingLoading = false;
      },
      error: error => {
        console.error('Failed to load trending books:', error);

        this.trendingBooks.set([]);
        this.currentTrendingIndex.set(0);

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
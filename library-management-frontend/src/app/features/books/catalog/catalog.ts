import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BooksService } from '../../../core/services/books';
import { Book } from '../../../core/models/book.model';
import { TokenService } from '../../../core/services/token';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss'
})
export class CatalogComponent implements OnInit {
  books: Book[] = [];

  page = 0;
  size = 6;
  totalPages = 0;
  totalElements = 0;

  searchKeyword = '';
  selectedGenre = '';
  selectedLanguage = '';
  selectedYear: number | null = null;

  sortBy = 'title';
  sortDir = 'asc';

  isLoading = false;

  constructor(
    private booksService: BooksService,
    public tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading = true;

    const hasFilters =
      !!this.searchKeyword ||
      !!this.selectedGenre ||
      !!this.selectedLanguage ||
      !!this.selectedYear;

    const request$ = hasFilters
      ? this.booksService.filterBooks(
          {
            keyword: this.searchKeyword,
            genre: this.selectedGenre,
            language: this.selectedLanguage,
            publicationYear: this.selectedYear
          },
          this.page,
          this.size,
          this.sortBy,
          this.sortDir
        )
      : this.booksService.getBooks(this.page, this.size, this.sortBy, this.sortDir);

    request$.subscribe({
      next: res => {
        this.books = res.content;
        this.page = res.page;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.books = [];
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.page = 0;
    this.loadBooks();
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.selectedGenre = '';
    this.selectedLanguage = '';
    this.selectedYear = null;
    this.sortBy = 'title';
    this.sortDir = 'asc';
    this.page = 0;
    this.loadBooks();
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadBooks();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadBooks();
    }
  }

  openDetails(bookId: number): void {
    this.router.navigate(['/books', bookId]);
  }
}
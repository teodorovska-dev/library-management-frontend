import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BooksService } from '../../../core/services/books';
import { Book } from '../../../core/models/book.model';
import { TokenService } from '../../../core/services/token';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [NgIf, RouterModule],
  templateUrl: './book-details.html',
  styleUrl: './book-details.scss'
})
export class BookDetailsComponent implements OnInit {
  book: Book | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private booksService: BooksService,
    public tokenService: TokenService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.booksService.getBookById(id).subscribe({
      next: data => {
        this.book = data;
        this.isLoading = false;
      },
      error: () => {
        this.router.navigate(['/catalog']);
      }
    });
  }

  goToEdit(): void {
    if (this.book) {
      this.router.navigate(['/admin/books/edit', this.book.id]);
    }
  }
}
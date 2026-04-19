import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BooksService } from '../../../core/services/books';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './edit-book.html',
  styleUrl: './edit-book.scss'
})
export class EditBookComponent implements OnInit {
  bookId!: number;
  errorMessage = '';
  isLoading = true;
  bookForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private booksService: BooksService
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      authorSurname: ['', Validators.required],
      authorInitials: ['', Validators.required],
      publicationYear: [null, Validators.required],
      copiesCount: [0, Validators.required],
      genre: [''],
      language: [''],
      isbn: [''],
      publisher: [''],
      description: [''],
      coverImageUrl: ['']
    });
  }

  ngOnInit(): void {
    this.bookId = Number(this.route.snapshot.paramMap.get('id'));

    this.booksService.getBookById(this.bookId).subscribe({
      next: book => {
        this.bookForm.patchValue({
          title: book.title ?? '',
          authorSurname: book.authorSurname ?? '',
          authorInitials: book.authorInitials ?? '',
          publicationYear: book.publicationYear ?? null,
          copiesCount: book.copiesCount ?? 0,
          genre: book.genre ?? '',
          language: book.language ?? '',
          isbn: book.isbn ?? '',
          publisher: book.publisher ?? '',
          description: book.description ?? '',
          coverImageUrl: book.coverImageUrl ?? ''
        });
        this.isLoading = false;
      },
      error: () => {
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  onSubmit(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    const bookData = {
      title: this.bookForm.value.title ?? '',
      authorSurname: this.bookForm.value.authorSurname ?? '',
      authorInitials: this.bookForm.value.authorInitials ?? '',
      publicationYear: Number(this.bookForm.value.publicationYear),
      copiesCount: Number(this.bookForm.value.copiesCount),
      genre: this.bookForm.value.genre ?? '',
      language: this.bookForm.value.language ?? '',
      isbn: this.bookForm.value.isbn ?? '',
      publisher: this.bookForm.value.publisher ?? '',
      description: this.bookForm.value.description ?? '',
      coverImageUrl: this.bookForm.value.coverImageUrl ?? ''
    };

    this.booksService.updateBook(this.bookId, bookData).subscribe({
      next: () => this.router.navigate(['/books', this.bookId]),
      error: err => {
        this.errorMessage = err?.error?.message || 'Failed to update book';
      }
    });
  }

  onWriteOff(): void {
    this.booksService.writeOffBook(this.bookId).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: err => {
        this.errorMessage = err?.error?.message || 'Failed to write off book';
      }
    });
  }
}
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { BooksService } from '../../../core/services/books';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './add-book.html',
  styleUrl: './add-book.scss'
})
export class AddBookComponent {
  errorMessage = '';
  bookForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private booksService: BooksService,
    private router: Router
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

    this.booksService.createBook(bookData).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: err => {
        this.errorMessage = err?.error?.message || 'Failed to create book';
      }
    });
  }
}
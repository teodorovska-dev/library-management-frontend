import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { BooksService } from '../../../core/services/books';
import { Book } from '../../../core/models/book.model';
import {
  MultiSelectComponent,
  MultiSelectOption
} from '../../../shared/components/multi-select/multi-select';

type EditBookModalType = 'delete-confirm' | 'validation-error' | 'success' | null;

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MultiSelectComponent],
  templateUrl: './edit-book.html',
  styleUrl: './edit-book.scss',
})
export class EditBookComponent implements OnInit {
  editBookForm: FormGroup;
  selectedCoverName = '';
  coverPreviewUrl: string | null = null;
  selectedCoverFile: File | null = null;
  currentCoverImageUrl = '';
  bookId!: number;
  isSubmitting = false;
  activeModal: EditBookModalType = null;

  readonly languageOptions: MultiSelectOption[] = [
    { label: 'English', value: 'English' },
    { label: 'Ukrainian', value: 'Ukrainian' },
    { label: 'Polish', value: 'Polish' },
    { label: 'German', value: 'German' },
    { label: 'French', value: 'French' },
  ];

  readonly categoryOptions: MultiSelectOption[] = [
    { label: 'Fiction', value: 'Fiction' },
    { label: 'Fantasy', value: 'Fantasy' },
    { label: 'Science', value: 'Science' },
    { label: 'History', value: 'History' },
    { label: 'Biography', value: 'Biography' },
    { label: 'Romance', value: 'Romance' },
    { label: 'Programming', value: 'Programming' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private booksService: BooksService
  ) {
    this.editBookForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      author: ['', [Validators.required, Validators.maxLength(150)]],
      publisher: ['', [Validators.required, Validators.maxLength(100)]],
      editors: ['', [Validators.maxLength(150)]],
      publicationYear: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      isbn: ['', [Validators.required, Validators.maxLength(20)]],
      format: ['', [Validators.required, Validators.maxLength(50)]],
      features: ['', [Validators.required, Validators.maxLength(150)]],
      languages: [[], [Validators.required]],
      category: [[], [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      availableCopies: ['', [Validators.required, Validators.min(1)]],
      cover: [null]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isNaN(id) || id <= 0) {
      this.router.navigate(['/catalog']);
      return;
    }

    this.bookId = id;
    this.loadBookData();
  }

  private loadBookData(): void {
    this.booksService.getBookById(this.bookId).subscribe({
      next: book => this.patchForm(book),
      error: error => {
        console.error('Failed to load book:', error);
        this.router.navigate(['/catalog']);
      }
    });
  }

  private patchForm(book: Book): void {
    this.currentCoverImageUrl = book.coverImageUrl || '';

    this.editBookForm.patchValue({
      title: book.title,
      author: book.authorFullName,
      publisher: book.publisher,
      editors: '',
      publicationYear: String(book.publicationYear),
      isbn: book.isbn,
      format: 'Printed book',
      features: `${book.copiesCount} copies in library`,
      languages: book.language ? [book.language] : [],
      category: book.genre ? [book.genre] : [],
      description: book.description,
      availableCopies: book.copiesCount,
      cover: null
    });

    this.coverPreviewUrl = this.resolveCoverUrl(book.coverImageUrl);
    this.selectedCoverName = book.coverImageUrl ? 'current-book-cover' : '';
  }

  get isTitleInvalid(): boolean { return this.isInvalid('title'); }
  get isAuthorInvalid(): boolean { return this.isInvalid('author'); }
  get isPublisherInvalid(): boolean { return this.isInvalid('publisher'); }
  get isPublicationYearInvalid(): boolean { return this.isInvalid('publicationYear'); }
  get isIsbnInvalid(): boolean { return this.isInvalid('isbn'); }
  get isFormatInvalid(): boolean { return this.isInvalid('format'); }
  get isFeaturesInvalid(): boolean { return this.isInvalid('features'); }
  get isLanguagesInvalid(): boolean { return this.isInvalid('languages'); }
  get isCategoryInvalid(): boolean { return this.isInvalid('category'); }
  get isDescriptionInvalid(): boolean { return this.isInvalid('description'); }
  get isAvailableCopiesInvalid(): boolean { return this.isInvalid('availableCopies'); }

  get isAnyModalOpen(): boolean {
    return this.activeModal !== null;
  }

  private isInvalid(controlName: string): boolean {
    const control = this.editBookForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.selectedCoverFile = file;
    this.selectedCoverName = file.name;
    this.editBookForm.patchValue({ cover: file });

    const reader = new FileReader();
    reader.onload = () => {
      this.coverPreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.editBookForm.invalid) {
      this.editBookForm.markAllAsTouched();
      this.openModal('validation-error');
      return;
    }

    this.isSubmitting = true;

    const upload$ = this.selectedCoverFile
      ? this.booksService.uploadBookCover(this.selectedCoverFile)
      : of({ url: this.currentCoverImageUrl });

    upload$
      .pipe(
        switchMap(uploadResponse => {
          const request = this.mapFormToBookRequest(uploadResponse.url);
          return this.booksService.updateBook(this.bookId, request);
        })
      )
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.openModal('success');
        },
        error: error => {
          console.error('Failed to update book:', error);
          this.isSubmitting = false;
          this.openModal('validation-error');
        }
      });
  }

  private mapFormToBookRequest(coverImageUrl: string) {
    const value = this.editBookForm.value;
    const selectedLanguages = value.languages as string[];
    const selectedCategories = value.category as string[];

    return {
      title: value.title.trim(),
      authorFullName: value.author.trim(),
      publicationYear: Number(value.publicationYear),
      copiesCount: Number(value.availableCopies),
      genre: selectedCategories[0],
      language: selectedLanguages[0],
      isbn: value.isbn.trim(),
      publisher: value.publisher.trim(),
      description: value.description.trim(),
      coverImageUrl
    };
  }

  private resolveCoverUrl(coverImageUrl?: string): string | null {
    if (!coverImageUrl || coverImageUrl.includes('example.com')) {
      return null;
    }

    if (coverImageUrl.startsWith('/uploads')) {
      return `http://localhost:8082${coverImageUrl}`;
    }

    return coverImageUrl;
  }

  onDeleteBook(): void {
    this.openModal('delete-confirm');
  }

  confirmDeleteBook(): void {
    this.booksService.writeOffBook(this.bookId).subscribe({
      next: () => {
        this.closeModal();
        this.router.navigate(['/catalog']);
      },
      error: error => {
        console.error('Failed to write off book:', error);
        this.closeModal();
      }
    });
  }

  onClear(): void {
    this.editBookForm.reset({
      languages: [],
      category: [],
      cover: null
    });

    this.selectedCoverName = '';
    this.coverPreviewUrl = null;
    this.selectedCoverFile = null;
  }

  openModal(type: EditBookModalType): void {
    this.activeModal = type;
  }

  closeModal(): void {
    this.activeModal = null;
  }

  onSuccessOk(): void {
    this.closeModal();
    this.router.navigate(['/catalog']);
  }
}
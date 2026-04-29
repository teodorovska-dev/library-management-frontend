import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  currentSplashColor = '';

  bookId!: number;
  isSubmitting = false;
  activeModal: EditBookModalType = null;

readonly languageOptions: MultiSelectOption[] = [
  { label: 'English', value: 'English' },
  { label: 'Ukrainian', value: 'Ukrainian' },
  { label: 'Polish', value: 'Polish' },
  { label: 'German', value: 'German' },
  { label: 'French', value: 'French' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'Italian', value: 'Italian' },
  { label: 'Portuguese', value: 'Portuguese' },
  { label: 'Dutch', value: 'Dutch' },
  { label: 'Swedish', value: 'Swedish' },
  { label: 'Norwegian', value: 'Norwegian' },
  { label: 'Danish', value: 'Danish' },
  { label: 'Finnish', value: 'Finnish' },
  { label: 'Czech', value: 'Czech' },
  { label: 'Slovak', value: 'Slovak' },
  { label: 'Hungarian', value: 'Hungarian' },
  { label: 'Romanian', value: 'Romanian' },
  { label: 'Bulgarian', value: 'Bulgarian' },
  { label: 'Greek', value: 'Greek' },
  { label: 'Turkish', value: 'Turkish' },
  { label: 'Arabic', value: 'Arabic' },
  { label: 'Hebrew', value: 'Hebrew' },
  { label: 'Chinese', value: 'Chinese' },
  { label: 'Japanese', value: 'Japanese' },
  { label: 'Korean', value: 'Korean' },
  { label: 'Hindi', value: 'Hindi' },
];

readonly categoryOptions: MultiSelectOption[] = [
  { label: 'Fiction', value: 'Fiction' },
  { label: 'Non-Fiction', value: 'Non-Fiction' },
  { label: 'Fantasy', value: 'Fantasy' },
  { label: 'Science Fiction', value: 'Science Fiction' },
  { label: 'Mystery', value: 'Mystery' },
  { label: 'Thriller', value: 'Thriller' },
  { label: 'Romance', value: 'Romance' },
  { label: 'Horror', value: 'Horror' },
  { label: 'Adventure', value: 'Adventure' },
  { label: 'Historical Fiction', value: 'Historical Fiction' },

  { label: 'Biography', value: 'Biography' },
  { label: 'Autobiography', value: 'Autobiography' },
  { label: 'Memoir', value: 'Memoir' },

  { label: 'Science', value: 'Science' },
  { label: 'Physics', value: 'Physics' },
  { label: 'Mathematics', value: 'Mathematics' },
  { label: 'Chemistry', value: 'Chemistry' },
  { label: 'Biology', value: 'Biology' },

  { label: 'Technology', value: 'Technology' },
  { label: 'Programming', value: 'Programming' },
  { label: 'Computer Science', value: 'Computer Science' },
  { label: 'Artificial Intelligence', value: 'Artificial Intelligence' },
  { label: 'Data Science', value: 'Data Science' },

  { label: 'Business', value: 'Business' },
  { label: 'Economics', value: 'Economics' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Marketing', value: 'Marketing' },

  { label: 'Self-Development', value: 'Self-Development' },
  { label: 'Psychology', value: 'Psychology' },
  { label: 'Philosophy', value: 'Philosophy' },

  { label: 'History', value: 'History' },
  { label: 'Politics', value: 'Politics' },

  { label: 'Education', value: 'Education' },
  { label: 'Art', value: 'Art' },
  { label: 'Design', value: 'Design' },
  { label: 'Photography', value: 'Photography' },

  { label: 'Health', value: 'Health' },
  { label: 'Fitness', value: 'Fitness' },
  { label: 'Cooking', value: 'Cooking' },

  { label: 'Travel', value: 'Travel' },
  { label: 'Children', value: 'Children' },
];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private booksService: BooksService,
    private cdr: ChangeDetectorRef
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

  onRemoveCover(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.selectedCoverName = '';
    this.coverPreviewUrl = null;
    this.selectedCoverFile = null;

    this.currentCoverImageUrl = '';
    this.currentSplashColor = '#d8ddd2';

    this.editBookForm.patchValue({ cover: null });
    this.cdr.detectChanges();
  }

  private loadBookData(): void {
    this.booksService.getBookById(this.bookId).subscribe({
      next: book => {
        this.patchForm(book);
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load book:', error);
        this.router.navigate(['/catalog']);
      }
    });
  }

  private patchForm(book: Book): void {
    this.currentCoverImageUrl = book.coverImageUrl || '';
    this.currentSplashColor = book.splashColor || '';

    this.editBookForm.patchValue({
      title: book.title,
      author: book.authorFullName,
      publisher: book.publisher,
      editors: '',
      publicationYear: String(book.publicationYear),
      isbn: book.isbn,
      format: 'Printed book',
      features: `${book.copiesCount} copies in library`,
      languages: book.languages || [],
      category: book.genres || [],
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
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.editBookForm.invalid) {
      this.editBookForm.markAllAsTouched();
      this.openModal('validation-error');
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    const upload$ = this.selectedCoverFile
      ? this.booksService.uploadBookCover(this.selectedCoverFile)
      : of({
          url: this.currentCoverImageUrl,
          splashColor: this.currentSplashColor
        });

    upload$
      .pipe(
        switchMap(uploadResponse => {
          const request = this.mapFormToBookRequest(
            uploadResponse.url,
            uploadResponse.splashColor
          );
          return this.booksService.updateBook(this.bookId, request);
        })
      )
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.openModal('success');
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Failed to update book:', error);
          this.isSubmitting = false;
          this.openModal('validation-error');
          this.cdr.detectChanges();
        }
      });
  }

  private mapFormToBookRequest(coverImageUrl: string, newSplashColor?: string) {
    const value = this.editBookForm.value;
    const selectedLanguages = value.languages as string[];
    const selectedCategories = value.category as string[];

    return {
      title: value.title.trim(),
      authorFullName: value.author.trim(),
      publicationYear: Number(value.publicationYear),
      copiesCount: Number(value.availableCopies),
      genres: selectedCategories,
      languages: selectedLanguages,
      isbn: value.isbn.trim(),
      publisher: value.publisher.trim(),
      description: value.description.trim(),
      coverImageUrl,
      splashColor: newSplashColor || this.currentSplashColor || '#d8ddd2'
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
    this.cdr.detectChanges();
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
        this.cdr.detectChanges();
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
    this.currentCoverImageUrl = '';
    this.currentSplashColor = '#d8ddd2';

    this.cdr.detectChanges();
  }

  openModal(type: EditBookModalType): void {
    this.activeModal = type;
  }

  closeModal(): void {
    this.activeModal = null;
    this.cdr.detectChanges();
  }

  onSuccessOk(): void {
    this.closeModal();
    this.router.navigate(['/catalog']);
  }

  onDigitsOnlyInput(event: Event, controlName: string, maxLength?: number): void {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, '');

  if (maxLength) {
    value = value.slice(0, maxLength);
  }

  input.value = value;
  this.editBookForm?.get(controlName)?.setValue(value, { emitEvent: false });
}

onLettersOnlyInput(event: Event, controlName: string): void {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/[^\p{L}\s.'-]/gu, '');

  input.value = value;
  this.editBookForm?.get(controlName)?.setValue(value, { emitEvent: false });
}

onIsbnInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/[^0-9-]/g, '').slice(0, 20);

  input.value = value;
  this.editBookForm?.get('isbn')?.setValue(value, { emitEvent: false });
}

getError(controlName: string): string | null {
  const control = this.editBookForm.get(controlName);

  if (!control || !control.touched || !control.errors) {
    return null;
  }

  if (control.errors['required']) return 'This field is required.';
  if (control.errors['maxlength']) return 'The value is too long.';
  if (control.errors['min']) return 'The value must be greater than 0.';
  if (control.errors['pattern']) {
    if (controlName === 'publicationYear') return 'Publication year must contain exactly 4 digits.';
    return 'Invalid format.';
  }

  return 'Invalid value.';
}
}
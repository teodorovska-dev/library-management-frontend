import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { BooksService } from '../../../core/services/books';
import { MultiSelectComponent, MultiSelectOption } from '../../../shared/components/multi-select/multi-select';

type AddBookModalType = 'validation-error' | 'success' | null;

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MultiSelectComponent],
  templateUrl: './add-book.html',
  styleUrl: './add-book.scss',
})
export class AddBookComponent {
  addBookForm: FormGroup;
  selectedCoverName = '';
  coverPreviewUrl: string | null = null;
  selectedCoverFile: File | null = null;
  isSubmitting = false;
  activeModal: AddBookModalType = null;

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
    private booksService: BooksService,
    private cdr: ChangeDetectorRef
  ) {
    this.addBookForm = this.fb.group({
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

  private isInvalid(controlName: string): boolean {
    const control = this.addBookForm.get(controlName);
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
    this.addBookForm.patchValue({ cover: file });

    const reader = new FileReader();

    reader.onload = () => {
      this.coverPreviewUrl = reader.result as string;
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.addBookForm.invalid) {
      this.addBookForm.markAllAsTouched();
      this.openModal('validation-error');
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    const upload$ = this.selectedCoverFile
      ? this.booksService.uploadBookCover(this.selectedCoverFile)
      : of({
          url: '',
          splashColor: '#d8ddd2'
        });

    upload$
      .pipe(
        switchMap(uploadResponse => {
          const request = this.mapFormToBookRequest(
            uploadResponse.url,
            uploadResponse.splashColor
          );

          return this.booksService.createBook(request);
        })
      )
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.openModal('success');
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Failed to create book:', error);
          this.isSubmitting = false;
          this.openModal('validation-error');
          this.cdr.detectChanges();
        }
      });
  }

  onRemoveCover(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.selectedCoverName = '';
    this.coverPreviewUrl = null;
    this.selectedCoverFile = null;

    this.addBookForm.patchValue({ cover: null });
    this.cdr.detectChanges();
  }

  private mapFormToBookRequest(coverImageUrl: string, splashColor: string) {
    const value = this.addBookForm.value;
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
      coverImageUrl,
      splashColor
    };
  }

  openModal(type: AddBookModalType): void {
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

  onClear(): void {
    this.addBookForm.reset({
      languages: [],
      category: [],
      cover: null
    });

    this.selectedCoverName = '';
    this.coverPreviewUrl = null;
    this.selectedCoverFile = null;

    this.cdr.detectChanges();
  }

  onCancel(): void {
    this.router.navigate(['/catalog']);
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  isSubmitting = false;

  activeModal: EditBookModalType = null;

  readonly languageOptions: MultiSelectOption[] = [
    { label: 'English', value: 'english' },
    { label: 'Ukrainian', value: 'ukrainian' },
    { label: 'Polish', value: 'polish' },
    { label: 'German', value: 'german' },
    { label: 'French', value: 'french' },
  ];

  readonly categoryOptions: MultiSelectOption[] = [
    { label: 'Fiction', value: 'fiction' },
    { label: 'Fantasy', value: 'fantasy' },
    { label: 'Science', value: 'science' },
    { label: 'History', value: 'history' },
    { label: 'Biography', value: 'biography' },
    { label: 'Romance', value: 'romance' },
    { label: 'Programming', value: 'programming' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.editBookForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      author: ['', [Validators.required, Validators.maxLength(100)]],
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
    const bookId = this.route.snapshot.paramMap.get('id');
    this.loadBookData(bookId);
  }

  private loadBookData(bookId: string | null): void {
    const mockBook = {
      id: bookId ?? '1',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      publisher: 'Prentice Hall',
      editors: 'Martin Team',
      publicationYear: '2008',
      isbn: '9780132350884',
      format: 'Hardcover',
      features: 'Bestseller, Illustrated',
      languages: ['english'],
      category: ['programming', 'science'],
      description: 'A handbook of agile software craftsmanship and code quality principles.',
      availableCopies: 12,
      coverUrl: 'assets/images/admin/mock-book-cover.png'
    };

    this.editBookForm.patchValue({
      title: mockBook.title,
      author: mockBook.author,
      publisher: mockBook.publisher,
      editors: mockBook.editors,
      publicationYear: mockBook.publicationYear,
      isbn: mockBook.isbn,
      format: mockBook.format,
      features: mockBook.features,
      languages: mockBook.languages,
      category: mockBook.category,
      description: mockBook.description,
      availableCopies: mockBook.availableCopies,
    });

    this.coverPreviewUrl = mockBook.coverUrl;
    this.selectedCoverName = 'current-book-cover.png';
  }

  get isTitleInvalid(): boolean {
    const control = this.editBookForm.get('title');
    return !!control && control.invalid && control.touched;
  }

  get isAuthorInvalid(): boolean {
    const control = this.editBookForm.get('author');
    return !!control && control.invalid && control.touched;
  }

  get isPublisherInvalid(): boolean {
    const control = this.editBookForm.get('publisher');
    return !!control && control.invalid && control.touched;
  }

  get isPublicationYearInvalid(): boolean {
    const control = this.editBookForm.get('publicationYear');
    return !!control && control.invalid && control.touched;
  }

  get isIsbnInvalid(): boolean {
    const control = this.editBookForm.get('isbn');
    return !!control && control.invalid && control.touched;
  }

  get isFormatInvalid(): boolean {
    const control = this.editBookForm.get('format');
    return !!control && control.invalid && control.touched;
  }

  get isFeaturesInvalid(): boolean {
    const control = this.editBookForm.get('features');
    return !!control && control.invalid && control.touched;
  }

  get isLanguagesInvalid(): boolean {
    const control = this.editBookForm.get('languages');
    return !!control && control.invalid && control.touched;
  }

  get isCategoryInvalid(): boolean {
    const control = this.editBookForm.get('category');
    return !!control && control.invalid && control.touched;
  }

  get isDescriptionInvalid(): boolean {
    const control = this.editBookForm.get('description');
    return !!control && control.invalid && control.touched;
  }

  get isAvailableCopiesInvalid(): boolean {
    const control = this.editBookForm.get('availableCopies');
    return !!control && control.invalid && control.touched;
  }

  get isAnyModalOpen(): boolean {
    return this.activeModal !== null;
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

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

    console.log('Updated book data:', this.editBookForm.value);

    setTimeout(() => {
      this.isSubmitting = false;
      this.openModal('success');
    }, 600);
  }

  onDeleteBook(): void {
    this.openModal('delete-confirm');
  }

  confirmDeleteBook(): void {
    this.closeModal();
    console.log('Book deleted');
    this.router.navigate(['/catalog']);
  }

  onClear(): void {
    this.editBookForm.reset({
      languages: [],
      category: [],
      cover: null
    });

    this.selectedCoverName = '';
    this.coverPreviewUrl = null;
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
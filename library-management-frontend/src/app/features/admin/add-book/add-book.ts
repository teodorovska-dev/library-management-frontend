import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
  isSubmitting = false;
  activeModal: AddBookModalType = null;

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
    private router: Router
  ) {
    this.addBookForm = this.fb.group({
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

  get isTitleInvalid(): boolean {
    const control = this.addBookForm.get('title');
    return !!control && control.invalid && control.touched;
  }

  get isAuthorInvalid(): boolean {
    const control = this.addBookForm.get('author');
    return !!control && control.invalid && control.touched;
  }

  get isPublisherInvalid(): boolean {
    const control = this.addBookForm.get('publisher');
    return !!control && control.invalid && control.touched;
  }

  get isPublicationYearInvalid(): boolean {
    const control = this.addBookForm.get('publicationYear');
    return !!control && control.invalid && control.touched;
  }

  get isIsbnInvalid(): boolean {
    const control = this.addBookForm.get('isbn');
    return !!control && control.invalid && control.touched;
  }

  get isFormatInvalid(): boolean {
    const control = this.addBookForm.get('format');
    return !!control && control.invalid && control.touched;
  }

  get isFeaturesInvalid(): boolean {
    const control = this.addBookForm.get('features');
    return !!control && control.invalid && control.touched;
  }

  get isLanguagesInvalid(): boolean {
    const control = this.addBookForm.get('languages');
    return !!control && control.invalid && control.touched;
  }

  get isCategoryInvalid(): boolean {
    const control = this.addBookForm.get('category');
    return !!control && control.invalid && control.touched;
  }

  get isDescriptionInvalid(): boolean {
    const control = this.addBookForm.get('description');
    return !!control && control.invalid && control.touched;
  }

  get isAvailableCopiesInvalid(): boolean {
    const control = this.addBookForm.get('availableCopies');
    return !!control && control.invalid && control.touched;
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.selectedCoverName = file.name;
    this.addBookForm.patchValue({ cover: file });

    const reader = new FileReader();
    reader.onload = () => {
      this.coverPreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.addBookForm.invalid) {
      this.addBookForm.markAllAsTouched();
      this.openModal('validation-error');
      return;
    }

    this.isSubmitting = true;

    console.log('Book form data:', this.addBookForm.value);

    setTimeout(() => {
      this.isSubmitting = false;
      this.openModal('success');
    }, 600);
  }

  openModal(type: AddBookModalType): void {
    this.activeModal = type;
  }

  closeModal(): void {
    this.activeModal = null;
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
  }

  onCancel(): void {
    this.router.navigate(['/catalog']);
  }
}
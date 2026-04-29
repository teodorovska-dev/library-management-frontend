import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

export interface MultiSelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multi-select.html',
  styleUrl: './multi-select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MultiSelectComponent,
      multi: true,
    },
  ],
})
export class MultiSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Search';
  @Input() hint = '';
  @Input() options: MultiSelectOption[] = [];
  @Input() required = false;
  @Input() maxDropdownHeight = 220;
  @Input() error = false;

  @Output() selectionChange = new EventEmitter<string[]>();

  isOpen = false;
  searchTerm = '';
  selectedValues: string[] = [];

  disabled = false;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  onChange: (value: string[]) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string[] | null): void {
    this.selectedValues = Array.isArray(value) ? [...value] : [];
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get filteredOptions(): MultiSelectOption[] {
    const normalizedSearchTerm = this.searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return this.options;
    }

    return this.options.filter(option =>
      option.label.toLowerCase().includes(normalizedSearchTerm)
    );
  }

  get selectedCount(): number {
    return this.selectedValues.length;
  }

  get allSelected(): boolean {
    return (
      this.filteredOptions.length > 0 &&
      this.filteredOptions.every(option =>
        this.selectedValues.includes(option.value)
      )
    );
  }

  get someSelected(): boolean {
    return (
      this.filteredOptions.some(option =>
        this.selectedValues.includes(option.value)
      ) && !this.allSelected
    );
  }

  get selectedLabels(): string[] {
    return this.options
      .filter(option => this.selectedValues.includes(option.value))
      .map(option => option.label);
  }

  toggleDropdown(): void {
    if (this.disabled) {
      return;
    }

    this.isOpen = !this.isOpen;
    this.onTouched();
  }

  openDropdown(): void {
    if (this.disabled) {
      return;
    }

    this.isOpen = true;
    this.onTouched();
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  toggleOption(value: string): void {
    if (this.disabled) {
      return;
    }

    if (this.selectedValues.includes(value)) {
      this.selectedValues = this.selectedValues.filter(item => item !== value);
    } else {
      this.selectedValues = [...this.selectedValues, value];
    }

    this.propagateChanges();
  }

  toggleSelectAll(): void {
    if (this.disabled || this.filteredOptions.length === 0) {
      return;
    }

    const filteredValues = this.filteredOptions.map(option => option.value);

    if (this.allSelected) {
      this.selectedValues = this.selectedValues.filter(
        value => !filteredValues.includes(value)
      );
    } else {
      this.selectedValues = Array.from(
        new Set([...this.selectedValues, ...filteredValues])
      );
    }

    this.propagateChanges();
  }

  clearSelection(event?: MouseEvent): void {
    event?.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.selectedValues = [];
    this.searchTerm = '';
    this.propagateChanges();
  }

  clearSearch(event: MouseEvent): void {
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.searchTerm = '';
    this.isOpen = true;
  }

  isSelected(value: string): boolean {
    return this.selectedValues.includes(value);
  }

  private propagateChanges(): void {
    this.onChange(this.selectedValues);
    this.selectionChange.emit(this.selectedValues);
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;

    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }
}
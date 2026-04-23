import {
  CommonModule,
} from '@angular/common';
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
    const normalized = this.searchTerm.trim().toLowerCase();

    if (!normalized) {
      return this.options;
    }

    return this.options.filter(option =>
      option.label.toLowerCase().includes(normalized)
    );
  }

  get selectedCount(): number {
    return this.selectedValues.length;
  }

  get allSelected(): boolean {
    return this.options.length > 0 && this.selectedValues.length === this.options.length;
  }

  get someSelected(): boolean {
    return this.selectedValues.length > 0 && !this.allSelected;
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

  closeDropdown(): void {
    this.isOpen = false;
  }

  toggleOption(value: string): void {
    if (this.selectedValues.includes(value)) {
      this.selectedValues = this.selectedValues.filter(item => item !== value);
    } else {
      this.selectedValues = [...this.selectedValues, value];
    }

    this.propagateChanges();
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.selectedValues = [];
    } else {
      this.selectedValues = this.options.map(option => option.value);
    }

    this.propagateChanges();
  }

  clearSelection(event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectedValues = [];
    this.searchTerm = '';
    this.propagateChanges();
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
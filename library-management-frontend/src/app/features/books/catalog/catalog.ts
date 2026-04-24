import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../../core/services/token';

type SortField = 'year' | 'author' | 'title';
type SortDirection = 'asc' | 'desc';

interface CatalogBook {
  id: number;
  title: string;
  author: string;
  year: number;
  status: 'Available' | 'Not available';
  category: string;
  language: string;
  coverUrl: string;
  splashUrl: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss'
})
export class CatalogComponent {
  searchKeyword = '';

  isSortModalOpen = false;
  isFilterModalOpen = false;
  isLanguageModalOpen = false;

  activeSortField: SortField | null = null;
  activeSortDirection: SortDirection | null = null;

  selectedCategories: string[] = [];
  selectedAvailability: string | null = null;
  selectedLanguages: string[] = [];

  readonly booksPerLoad = 12;
  visibleBooksCount = this.booksPerLoad;

  categories = [
    'Fiction',
    'Non-Fiction',
    'Thriller',
    'Romance',
    'Fantasy',
    'Action',
    'Young Adult',
    'Mystery',
    'History',
    'Psychology',
    'Classic',
    'Biography',
    'Health & Wellness',
    'Self Development'
  ];

  languages = [
    'English',
    'Ukrainian',
    'Polish',
    'German',
    'French',
    'Italian',
    'Spanish',
    'Chinese',
    'Japanese'
  ];

  books: CatalogBook[] = [
    {
      id: 1,
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      year: 2020,
      status: 'Available',
      category: 'Psychology',
      language: 'English',
      coverUrl: 'assets/images/catalog/book-psychology-money.png',
      splashUrl: 'assets/images/catalog/splash-green.svg'
    },
    {
      id: 2,
      title: 'It Ends With Us',
      author: 'Colleen Hoover',
      year: 2022,
      status: 'Available',
      category: 'Romance',
      language: 'English',
      coverUrl: 'assets/images/catalog/book-it-ends-with-us.png',
      splashUrl: 'assets/images/catalog/splash-pink.svg'
    },
    {
      id: 3,
      title: 'The Subtle Art of Not Giving a F*ck',
      author: 'Mark Manson',
      year: 2016,
      status: 'Available',
      category: 'Self Development',
      language: 'English',
      coverUrl: 'assets/images/catalog/book-subtle-art.png',
      splashUrl: 'assets/images/catalog/splash-orange.svg'
    },
    {
      id: 4,
      title: 'A Good Girl’s Guide to Murder',
      author: 'Holly Jackson',
      year: 2019,
      status: 'Available',
      category: 'Mystery',
      language: 'English',
      coverUrl: 'assets/images/catalog/book-good-girl-guide.png',
      splashUrl: 'assets/images/catalog/splash-white.svg'
    },
    {
      id: 5,
      title: 'Atomic Habits',
      author: 'James Clear',
      year: 2018,
      status: 'Available',
      category: 'Self Development',
      language: 'Ukrainian',
      coverUrl: 'assets/images/catalog/book-psychology-money.png',
      splashUrl: 'assets/images/catalog/splash-green.svg'
    },
    {
      id: 6,
      title: 'Verity',
      author: 'Colleen Hoover',
      year: 2018,
      status: 'Not available',
      category: 'Thriller',
      language: 'Polish',
      coverUrl: 'assets/images/catalog/book-it-ends-with-us.png',
      splashUrl: 'assets/images/catalog/splash-pink.svg'
    },
    {
      id: 7,
      title: 'Everything Is F*cked',
      author: 'Mark Manson',
      year: 2019,
      status: 'Available',
      category: 'Psychology',
      language: 'English',
      coverUrl: 'assets/images/catalog/book-subtle-art.png',
      splashUrl: 'assets/images/catalog/splash-orange.svg'
    },
    {
      id: 8,
      title: 'Good Girl, Bad Blood',
      author: 'Holly Jackson',
      year: 2020,
      status: 'Not available',
      category: 'Mystery',
      language: 'German',
      coverUrl: 'assets/images/catalog/book-good-girl-guide.png',
      splashUrl: 'assets/images/catalog/splash-white.svg'
    },
    {
      id: 9,
      title: 'Rich Dad Poor Dad',
      author: 'Robert Kiyosaki',
      year: 1997,
      status: 'Available',
      category: 'Biography',
      language: 'English',
      coverUrl: 'assets/images/catalog/book-psychology-money.png',
      splashUrl: 'assets/images/catalog/splash-green.svg'
    },
    {
      id: 10,
      title: 'Ugly Love',
      author: 'Colleen Hoover',
      year: 2014,
      status: 'Available',
      category: 'Romance',
      language: 'French',
      coverUrl: 'assets/images/catalog/book-it-ends-with-us.png',
      splashUrl: 'assets/images/catalog/splash-pink.svg'
    },
    {
      id: 11,
      title: 'Models',
      author: 'Mark Manson',
      year: 2011,
      status: 'Available',
      category: 'Non-Fiction',
      language: 'Italian',
      coverUrl: 'assets/images/catalog/book-subtle-art.png',
      splashUrl: 'assets/images/catalog/splash-orange.svg'
    },
    {
      id: 12,
      title: 'As Good As Dead',
      author: 'Holly Jackson',
      year: 2021,
      status: 'Available',
      category: 'Thriller',
      language: 'Spanish',
      coverUrl: 'assets/images/catalog/book-good-girl-guide.png',
      splashUrl: 'assets/images/catalog/splash-white.svg'
    },
    {
      id: 13,
      title: 'The Silent Patient',
      author: 'Alex Michaelides',
      year: 2019,
      status: 'Available',
      category: 'Thriller',
      language: 'English',
      coverUrl: 'assets/images/catalog/book-psychology-money.png',
      splashUrl: 'assets/images/catalog/splash-green.svg'
    },
    {
      id: 14,
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      year: 1988,
      status: 'Available',
      category: 'Fiction',
      language: 'Polish',
      coverUrl: 'assets/images/catalog/book-it-ends-with-us.png',
      splashUrl: 'assets/images/catalog/splash-pink.svg'
    },
    {
      id: 15,
      title: 'Becoming',
      author: 'Michelle Obama',
      year: 2018,
      status: 'Available',
      category: 'Biography',
      language: 'German',
      coverUrl: 'assets/images/catalog/book-subtle-art.png',
      splashUrl: 'assets/images/catalog/splash-orange.svg'
    },
    {
      id: 16,
      title: 'The Hobbit',
      author: 'J. R. R. Tolkien',
      year: 1937,
      status: 'Not available',
      category: 'Fantasy',
      language: 'English',
      coverUrl: 'assets/images/catalog/book-good-girl-guide.png',
      splashUrl: 'assets/images/catalog/splash-white.svg'
    },
    {
      id: 17,
      title: '1984',
      author: 'George Orwell',
      year: 1949,
      status: 'Available',
      category: 'Classic',
      language: 'Ukrainian',
      coverUrl: 'assets/images/catalog/book-psychology-money.png',
      splashUrl: 'assets/images/catalog/splash-green.svg'
    },
    {
      id: 18,
      title: 'Dune',
      author: 'Frank Herbert',
      year: 1965,
      status: 'Available',
      category: 'Fiction',
      language: 'Italian',
      coverUrl: 'assets/images/catalog/book-it-ends-with-us.png',
      splashUrl: 'assets/images/catalog/splash-pink.svg'
    },
    {
      id: 19,
      title: 'The Power of Now',
      author: 'Eckhart Tolle',
      year: 1997,
      status: 'Available',
      category: 'Health & Wellness',
      language: 'Spanish',
      coverUrl: 'assets/images/catalog/book-subtle-art.png',
      splashUrl: 'assets/images/catalog/splash-orange.svg'
    },
    {
      id: 20,
      title: 'Little Women',
      author: 'Louisa May Alcott',
      year: 1868,
      status: 'Available',
      category: 'Classic',
      language: 'French',
      coverUrl: 'assets/images/catalog/book-good-girl-guide.png',
      splashUrl: 'assets/images/catalog/splash-white.svg'
    },
    {
      id: 21,
      title: 'Educated',
      author: 'Tara Westover',
      year: 2018,
      status: 'Not available',
      category: 'Biography',
      language: 'English',
      coverUrl: 'assets/images/catalog/book-psychology-money.png',
      splashUrl: 'assets/images/catalog/splash-green.svg'
    },
    {
      id: 22,
      title: 'The Hunger Games',
      author: 'Suzanne Collins',
      year: 2008,
      status: 'Available',
      category: 'Young Adult',
      language: 'German',
      coverUrl: 'assets/images/catalog/book-it-ends-with-us.png',
      splashUrl: 'assets/images/catalog/splash-pink.svg'
    },
    {
      id: 23,
      title: 'Gone Girl',
      author: 'Gillian Flynn',
      year: 2012,
      status: 'Available',
      category: 'Mystery',
      language: 'English',
      coverUrl: 'assets/images/catalog/book-subtle-art.png',
      splashUrl: 'assets/images/catalog/splash-orange.svg'
    },
    {
      id: 24,
      title: 'Deep Work',
      author: 'Cal Newport',
      year: 2016,
      status: 'Available',
      category: 'Self Development',
      language: 'Polish',
      coverUrl: 'assets/images/catalog/book-good-girl-guide.png',
      splashUrl: 'assets/images/catalog/splash-white.svg'
    }
  ];

  filteredBooks: CatalogBook[] = [...this.books];

  constructor(
    public tokenService: TokenService,
    private router: Router
  ) {}

  get isAdmin(): boolean {
    return true;
  }

  get visibleBooks(): CatalogBook[] {
    return this.filteredBooks.slice(0, this.visibleBooksCount);
  }

  get canLoadMore(): boolean {
    return this.visibleBooksCount < this.filteredBooks.length;
  }

  loadMoreBooks(): void {
    this.visibleBooksCount += this.booksPerLoad;
  }

  resetVisibleBooks(): void {
    this.visibleBooksCount = this.booksPerLoad;
  }

  openSortModal(): void {
    this.isSortModalOpen = true;
  }

  closeSortModal(): void {
    this.isSortModalOpen = false;
  }

  selectSort(field: SortField, direction: SortDirection): void {
    this.activeSortField = field;
    this.activeSortDirection = direction;
  }

  resetSort(): void {
    this.activeSortField = null;
    this.activeSortDirection = null;
    this.filteredBooks = [...this.filteredBooks];
    this.resetVisibleBooks();
  }

  applySort(): void {
    if (!this.activeSortField || !this.activeSortDirection) {
      this.closeSortModal();
      return;
    }

    this.filteredBooks = [...this.filteredBooks].sort((a, b) => {
      let firstValue: string | number = '';
      let secondValue: string | number = '';

      if (this.activeSortField === 'year') {
        firstValue = a.year;
        secondValue = b.year;
      }

      if (this.activeSortField === 'author') {
        firstValue = a.author.toLowerCase();
        secondValue = b.author.toLowerCase();
      }

      if (this.activeSortField === 'title') {
        firstValue = a.title.toLowerCase();
        secondValue = b.title.toLowerCase();
      }

      if (firstValue < secondValue) {
        return this.activeSortDirection === 'asc' ? -1 : 1;
      }

      if (firstValue > secondValue) {
        return this.activeSortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });

    this.resetVisibleBooks();
    this.closeSortModal();
  }

  openFilterModal(): void {
    this.isFilterModalOpen = true;
  }

  closeFilterModal(): void {
    this.isFilterModalOpen = false;
  }

  openLanguageModal(): void {
    this.isLanguageModalOpen = true;
  }

  closeLanguageModal(): void {
    this.isLanguageModalOpen = false;
  }

  toggleCategory(category: string): void {
    this.selectedCategories = this.selectedCategories.includes(category)
      ? this.selectedCategories.filter(item => item !== category)
      : [...this.selectedCategories, category];
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  selectAvailability(status: string): void {
    this.selectedAvailability = this.selectedAvailability === status ? null : status;
  }

  toggleLanguage(language: string): void {
    this.selectedLanguages = this.selectedLanguages.includes(language)
      ? this.selectedLanguages.filter(item => item !== language)
      : [...this.selectedLanguages, language];
  }

  isLanguageSelected(language: string): boolean {
    return this.selectedLanguages.includes(language);
  }

  resetFilters(): void {
    this.selectedCategories = [];
    this.selectedAvailability = null;
    this.selectedLanguages = [];
    this.filteredBooks = [...this.books];
    this.resetVisibleBooks();
  }

  applyFilters(): void {
    this.filteredBooks = this.books.filter(book => {
      const matchesCategory =
        this.selectedCategories.length === 0 ||
        this.selectedCategories.includes(book.category);

      const matchesAvailability =
        !this.selectedAvailability ||
        book.status === this.selectedAvailability;

      const matchesLanguage =
        this.selectedLanguages.length === 0 ||
        this.selectedLanguages.includes(book.language);

      return matchesCategory && matchesAvailability && matchesLanguage;
    });

    this.resetVisibleBooks();
    this.closeFilterModal();
  }

  applyLanguages(): void {
    this.closeLanguageModal();
  }

  openDetails(bookId: number): void {
    this.router.navigate(['/books', bookId]);
  }

  goToAddBook(): void {
    this.router.navigate(['/admin/add-book']);
  }
}
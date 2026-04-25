import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';
import { PagedResponse } from '../models/paged-response.model';

export interface BookFilterParams {
  keyword?: string;
  genres?: string[];
  languages?: string[];
  status?: string | null;
  publicationYear?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  private readonly apiUrl = `${environment.apiBaseUrl}/books`;

  constructor(private http: HttpClient) {}

  getBooks(page: number, size: number, sortBy = 'title', sortDir = 'asc'): Observable<PagedResponse<Book>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PagedResponse<Book>>(`${this.apiUrl}/paged`, { params });
  }

  filterBooks(
    filters: BookFilterParams,
    page: number,
    size: number,
    sortBy = 'title',
    sortDir = 'asc'
  ): Observable<PagedResponse<Book>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (filters.keyword?.trim()) {
      params = params.set('keyword', filters.keyword.trim());
    }

    filters.genres?.forEach(genre => {
      params = params.append('genres', genre);
    });

    filters.languages?.forEach(language => {
      params = params.append('languages', language);
    });

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    if (filters.publicationYear) {
      params = params.set('publicationYear', filters.publicationYear);
    }

    return this.http.get<PagedResponse<Book>>(`${this.apiUrl}/filter`, { params });
  }

  getAvailableGenres(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/genres`);
  }

  getAvailableLanguages(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/languages`);
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  createBook(book: Partial<Book>): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book);
  }

  updateBook(id: number, book: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, book);
  }

  writeOffBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
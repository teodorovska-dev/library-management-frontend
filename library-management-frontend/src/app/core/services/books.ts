import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';
import { PagedResponse } from '../models/paged-response.model';

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  private readonly apiUrl = `${environment.apiBaseUrl}/books`;

  constructor(private http: HttpClient) {}

  getBooks(page: number, size: number, sortBy: string, sortDir: string): Observable<PagedResponse<Book>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PagedResponse<Book>>(`${this.apiUrl}/paged`, { params });
  }

  searchBooks(keyword: string, page: number, size: number, sortBy = 'title', sortDir = 'asc'): Observable<PagedResponse<Book>> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PagedResponse<Book>>(`${this.apiUrl}/search`, { params });
  }

  filterBooks(filters: any, page: number, size: number, sortBy = 'title', sortDir = 'asc'): Observable<PagedResponse<Book>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (filters.keyword) params = params.set('keyword', filters.keyword);
    if (filters.genre) params = params.set('genre', filters.genre);
    if (filters.language) params = params.set('language', filters.language);
    if (filters.publicationYear) params = params.set('publicationYear', filters.publicationYear);

    return this.http.get<PagedResponse<Book>>(`${this.apiUrl}/filter`, { params });
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
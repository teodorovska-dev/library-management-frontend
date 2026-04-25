import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';

export interface FavoriteStatusResponse {
  favorite: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly apiUrl = `${environment.apiBaseUrl}/favorites`;

  constructor(private http: HttpClient) {}

  getFavorites(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  addToFavorites(bookId: number): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/${bookId}`, {});
  }

  removeFromFavorites(bookId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${bookId}`);
  }

  isFavorite(bookId: number): Observable<FavoriteStatusResponse> {
    return this.http.get<FavoriteStatusResponse>(`${this.apiUrl}/${bookId}/exists`);
  }
}
import { Injectable } from '@angular/core';
import { AuthResponse } from '../models/auth-response.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly STORAGE_MODE_KEY = 'auth_storage_mode';

  saveAuthData(authResponse: AuthResponse, rememberMe: boolean = true): void {
    const storage = rememberMe ? localStorage : sessionStorage;

    this.clear();

    storage.setItem(this.TOKEN_KEY, authResponse.token);
    storage.setItem(
      this.USER_KEY,
      JSON.stringify({
        userId: authResponse.userId,
        fullName: authResponse.fullName,
        email: authResponse.email,
        role: authResponse.role
      })
    );

    localStorage.setItem(this.STORAGE_MODE_KEY, rememberMe ? 'local' : 'session');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): User | null {
    const userJson =
      localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);

    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson) as User;
    } catch {
      this.clear();
      return null;
    }
  }

  getUserRole(): string | null {
    return this.getUser()?.role ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  clear(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.STORAGE_MODE_KEY);

    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }
}
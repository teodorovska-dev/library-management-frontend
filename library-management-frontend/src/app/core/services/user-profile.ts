import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface UserProfileResponse {
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly apiUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  getCurrentProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.apiUrl}/me`);
  }

  updateCurrentProfile(request: UpdateProfileRequest): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(`${this.apiUrl}/me`, request);
  }

  uploadAvatar(file: File): Observable<UserProfileResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post<UserProfileResponse>(`${this.apiUrl}/me/avatar`, formData);
}
}
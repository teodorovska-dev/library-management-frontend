import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export type DashboardTrend = 'increase' | 'decrease' | 'neutral';

export interface DashboardTrendStat {
  value: number;
  trend: DashboardTrend;
  change: number;
}

export interface AdminDashboardStats {
  totalBooks: DashboardTrendStat;
  totalTitles: DashboardTrendStat;
  totalAuthors: DashboardTrendStat;
  writtenOffBooks: DashboardTrendStat;
  availableCopies: DashboardTrendStat;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/stats`);
  }
}
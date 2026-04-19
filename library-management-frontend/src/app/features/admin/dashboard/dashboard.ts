import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { BooksService } from '../../../core/services/books';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  totalBooks = 0;

  constructor(
    private booksService: BooksService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.booksService.getBooks(0, 100, 'title', 'asc').subscribe({
      next: res => {
        this.totalBooks = res.totalElements;
      }
    });
  }

  navigateToAddBook(): void {
    this.router.navigate(['/admin/books/add']);
  }
}
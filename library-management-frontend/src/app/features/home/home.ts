import { Component, signal } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';

interface TrendingBook {
  id: number;
  title: string;
  author: string;
  year: number;
  status: string;
  coverUrl: string;
  splashType: 'green' | 'pink' | 'orange' | 'white';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgClass, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent {
  trendingBooks = signal<TrendingBook[]>([
    {
      id: 1,
      title: 'THE PSYCHOLOGY OF MONEY',
      author: 'Morgan Housel',
      year: 2020,
      status: 'Available',
      coverUrl: 'assets/images/home/trending-book-1.png',
      splashType: 'green',
    },
    {
      id: 2,
      title: 'IT ENDS WITH US',
      author: 'Colleen Hoover',
      year: 2016,
      status: 'Available',
      coverUrl: 'assets/images/home/trending-book-2.png',
      splashType: 'pink',
    },
    {
      id: 3,
      title: 'THE SUBTLE ART OF NOT GIVING A F*CK',
      author: 'Mark Manson',
      year: 2016,
      status: 'Available',
      coverUrl: 'assets/images/home/trending-book-3.png',
      splashType: 'orange',
    },
    {
      id: 4,
      title: "A GOOD GIRL'S GUIDE TO MURDER",
      author: 'Holly Jackson',
      year: 2019,
      status: 'Available',
      coverUrl: 'assets/images/home/trending-book-4.png',
      splashType: 'white',
    },
  ]);

  currentIndex = signal(0);

  nextSlide(): void {
    const booksCount = this.trendingBooks().length;

    if (booksCount === 0) {
      return;
    }

    this.currentIndex.update((index) => (index + 1) % booksCount);
  }

  prevSlide(): void {
    const booksCount = this.trendingBooks().length;

    if (booksCount === 0) {
      return;
    }

    this.currentIndex.update((index) => (index - 1 + booksCount) % booksCount);
  }
}
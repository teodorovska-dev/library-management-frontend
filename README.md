# Library Management System Frontend

Frontend part of the **Library Management System** developed using Angular and TypeScript.  
The application provides a modern responsive user interface for interacting with the digital library system, including authentication, catalog management, favorites, user profiles, and administrative functionality.

---

## Overview

Library Management System Frontend is a single-page application (SPA) that communicates with the backend REST API developed using Spring Boot.  
The frontend is designed with a responsive and minimalist dark-themed interface focused on usability, performance, and modern UI/UX practices.

The application supports authenticated and non-authenticated users, dynamic catalog interactions, role-based functionality, and administrative management tools.

---

## Live Demo

### Frontend
```text
https://library-management-frontend-teodorovska-devs-projects.vercel.app
```

### Backend API
```text
https://library-management-system-0ea7.onrender.com
```

---

## Main Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Password recovery flow
- Persistent authenticated sessions
- Role-based access control (`USER`, `ADMIN`)
- Route protection using Angular Guards
- Automatic JWT token injection using HTTP Interceptors

### Home Page
- Responsive landing page
- Trending books section
- Feature overview section
- Dynamic navigation
- Footer with application information

### Book Catalog
- Dynamic book catalog
- Search functionality
- Filtering by categories, languages, and availability
- Sorting by title, author, and publication year
- Pagination support
- Responsive catalog layout

### Book Details
- Detailed book information page
- Dynamic splash color generation
- Book availability information
- Add to favorites functionality

### Favorites System
- Personalized favorite books
- Dynamic favorite list management
- Quick access to saved books

### User Profile
- User profile management
- Avatar upload support
- Personal information editing
- Personalized dashboard

### Admin Dashboard
- Add new books
- Edit existing books
- Upload book covers
- Write-off books
- Library statistics overview
- Administrative management tools

---

## Technology Stack

### Frontend Technologies
- Angular
- TypeScript
- SCSS
- Angular Router
- Reactive Forms
- Angular HttpClient
- RxJS

### UI & Styling
- Responsive Design
- CSS Flexbox & Grid
- Dynamic SCSS Styling
- Custom Animations
- Dark Minimalist UI

### Deployment & Cloud
- Vercel
- Cloudinary CDN Integration

---

## Project Architecture

The frontend project follows a modular Angular architecture:

```text
core
shared
pages
components
services
models
guards
interceptors
layouts
environments
```

---

## Application Roles

### USER
- Browse books
- Search and filter catalog
- View book details
- Add books to favorites
- Manage personal profile

### ADMIN
- Full access to administrative functionality
- Manage books and availability
- Access statistics dashboard
- Upload and edit book data

---

## Responsive Design

The application is fully responsive and optimized for:
- Desktop devices
- Tablets
- Mobile devices

Responsive layouts are implemented using modern CSS and Angular component architecture.

---

## Security Features

The frontend implements several security-related mechanisms:
- JWT token storage
- Protected routes
- Automatic unauthorized request handling
- Secure communication with backend API
- Role-based UI rendering

---

## Installation & Setup

### Clone Repository

```bash
git clone https://github.com/teodorovska-dev/library-management-system-frontend.git
cd library-management-system-frontend
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment

Update the API URL inside:

```text
src/environments/environment.ts
```

Example:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api'
};
```

---

## Run Development Server

```bash
ng serve
```

The application will be available at:

```text
http://localhost:4200
```

---

## Build Production Version

```bash
ng build --configuration production
```

---

## Backend Repository

```text
https://github.com/teodorovska-dev/library-management-system
```

---

## Future Improvements

- Recommendation system
- Dark/light theme switcher
- Book reservation functionality
- Advanced search system
- Notifications
- Reading history
- Accessibility improvements

---

## Author

**Anastasiia Teodorovska**  
Applied Mathematics Student  
Lviv Polytechnic National University

GitHub:
```text
https://github.com/teodorovska-dev
```

---

## License

This project was developed for educational purposes as a university course project.

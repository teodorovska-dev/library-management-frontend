export interface Book {
  id: number;
  title: string;
  authorFullName: string;
  publicationYear: number;
  copiesCount: number;
  genres: string[];
  languages: string[];
  isbn: string;
  publisher: string;
  description: string;
  coverImageUrl: string;
  splashColor?: string;
  status: string;

  createdById?: number;
  createdByName?: string;
  updatedById?: number;
  updatedByName?: string;
}
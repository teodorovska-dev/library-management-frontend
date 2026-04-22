export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  adminAccessKey?: string;
}
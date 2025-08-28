export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'analyst' | 'investigator';
  firstName: string;
  lastName: string;
  department: string;
  lastLogin?: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
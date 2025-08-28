import { useState, useCallback } from 'react';
import { User, AuthState, LoginCredentials } from '../types/auth';

// Mock user database
const mockUsers: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin123',
    user: {
      id: '1',
      username: 'admin',
      email: 'admin@amlguard.com',
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      department: 'IT Security',
      permissions: ['view_all', 'manage_users', 'export_data', 'system_config'],
    },
  },
  analyst: {
    password: 'analyst123',
    user: {
      id: '2',
      username: 'analyst',
      email: 'analyst@amlguard.com',
      role: 'analyst',
      firstName: 'Financial',
      lastName: 'Analyst',
      department: 'Compliance',
      permissions: ['view_transactions', 'create_alerts', 'export_data'],
    },
  },
  investigator: {
    password: 'invest123',
    user: {
      id: '3',
      username: 'investigator',
      email: 'investigator@amlguard.com',
      role: 'investigator',
      firstName: 'AML',
      lastName: 'Investigator',
      department: 'Investigation',
      permissions: ['view_transactions', 'manage_alerts', 'view_reports'],
    },
  },
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockUser = mockUsers[credentials.username];
    
    if (!mockUser || mockUser.password !== credentials.password) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Invalid username or password. Please check your credentials and try again.',
      }));
      return;
    }

    const userWithLastLogin = {
      ...mockUser.user,
      lastLogin: new Date().toISOString(),
    };

    setAuthState({
      user: userWithLastLogin,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    // Store in localStorage for persistence
    localStorage.setItem('aml_user', JSON.stringify(userWithLastLogin));
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    localStorage.removeItem('aml_user');
  }, []);

  const checkAuthStatus = useCallback(() => {
    const storedUser = localStorage.getItem('aml_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        localStorage.removeItem('aml_user');
      }
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus,
  };
};
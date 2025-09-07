import { useState, useCallback, useEffect } from 'react';
import { User, AuthState, LoginCredentials } from '../types/auth';

const API_BASE_URL = 'http://localhost:8000/api/auth'; // Your Django backend URL

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  // Log auth state changes
  useEffect(() => {
    console.log("Auth State Updated:", authState);
  }, [authState]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log("Login API Response:", response.status, data);

      if (response.ok) {
        const userWithLastLogin = {
          ...data.user,
          lastLogin: new Date().toISOString(),
        };
        setAuthState({
          user: userWithLastLogin,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        localStorage.setItem('aml_user', JSON.stringify(userWithLastLogin));
        localStorage.setItem('aml_token', data.token);
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Login failed',
        }));
      }
    } catch (error: any) {
      console.error("Login API Error:", error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Network error',
      }));
    }
  }, []);

  const logout = useCallback(() => {
    console.log("Logging out...");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    localStorage.removeItem('aml_user');
    localStorage.removeItem('aml_token');
  }, []);

  const checkAuthStatus = useCallback(async () => {
    console.log("Checking auth status...");
    const storedUser = localStorage.getItem('aml_user');
    const storedToken = localStorage.getItem('aml_token');

    if (storedUser && storedToken) {
      try {
        const response = await fetch(`${API_BASE_URL}/user/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${storedToken}`,
          },
        });

        const data = await response.json();
        console.log("Check Auth API Response:", response.status, data);

        if (response.ok) {
          const user = data;
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          console.log("Auth check failed, clearing local storage.");
          localStorage.removeItem('aml_user');
          localStorage.removeItem('aml_token');
          setAuthState(prev => ({ ...prev, isAuthenticated: false, user: null }));
        }
      } catch (error) {
        console.error("Check Auth API Error:", error);
        localStorage.removeItem('aml_user');
        localStorage.removeItem('aml_token');
        setAuthState(prev => ({ ...prev, isAuthenticated: false, user: null }));
      }
    } else {
      console.log("No stored user or token, not authenticated.");
      setAuthState(prev => ({ ...prev, isAuthenticated: false, user: null }));
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus,
  };
};
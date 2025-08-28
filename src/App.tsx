import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, isAuthenticated, isLoading, error, login, logout, checkAuthStatus } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  if (!isAuthenticated) {
    return <Login onLogin={login} error={error} isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard user={user!} onLogout={logout} />
    </div>
  );
}

export default App;
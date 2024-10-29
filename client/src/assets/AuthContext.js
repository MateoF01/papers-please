import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthentication = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user', { withCredentials: true });
      setIsAuthenticated(true);
      setIsAdmin(response.data.isAdmin);
    } catch {
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  const handleLogout = async () => {
    await axios.post('http://localhost:8080/api/logout', {}, { withCredentials: true });
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, loading, handleLogout, checkAuthentication }}>
      {children}
    </AuthContext.Provider>
  );
}

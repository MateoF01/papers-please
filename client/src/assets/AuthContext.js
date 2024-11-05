import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthentication = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user`, { withCredentials: true });
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
    await axios.post(`${backendUrl}/api/logout`, {}, { withCredentials: true });
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, loading, handleLogout, checkAuthentication }}>
      {children}
    </AuthContext.Provider>
  );
}

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

function AuthenticatedRoute({ element: Component, ...rest }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user`, { withCredentials: true });
        setIsAuthenticated(response.data ? true : false);
        setLoading(false);
      } catch (err) {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };
    checkAuthentication();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
}

export default AuthenticatedRoute;

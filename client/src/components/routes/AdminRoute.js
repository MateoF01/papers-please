import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

function AdminRoute({ element: Component, ...rest }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user`, { withCredentials: true });
        setIsAdmin(response.data.isAdmin);
        setLoading(false);
      } catch (err) {
        setIsAdmin(false);
        setLoading(false);
      }
    };
    checkAdminStatus();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return isAdmin ? <Component {...rest} /> : <Navigate to="/home" />;
}

export default AdminRoute;

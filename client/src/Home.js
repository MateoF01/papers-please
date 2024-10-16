import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BackgroundImage from './background.png';

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook para navegar entre rutas

  useEffect(() => {
    // Llamada a la API para obtener la información del usuario desde la sesión
    axios.get('http://localhost:8080/api/usuario',  { withCredentials: true })
      .then(response => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error al obtener la información del usuario');
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    // Llamada al endpoint de logout
    axios.post('http://localhost:8080/api/logout', {}, { withCredentials: true })
      .then(() => {
        navigate('/'); // Redirige a la página de inicio (Root)
      })
      .catch(() => {
        setError('Error al cerrar la sesión');
      });
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const HomeStyle = {
    backgroundImage: `url(${BackgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    color: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    textShadow: '2px 2px 2px black'
  };

  return (
    <div style={HomeStyle}>
      <h1>Bienvenido, {user.user_name}</h1>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
}

export default Home;

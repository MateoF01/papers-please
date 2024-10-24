import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BackgroundImage from './background.png';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';
import DefaultButton from './components/button/DefaultButton';

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook para navegar entre rutas

  useEffect(() => {
    // Llamada a la API para obtener la información del usuario desde la sesión
    axios.get('http://localhost:8080/api/user',  { withCredentials: true })
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
    setLoadingButton(true)
    axios.post('http://localhost:8080/api/logout', {}, { withCredentials: true })
    .then(() => {
        setLoadingButton(false)
        navigate('/'); // Redirige a la página de inicio (Root)
      })
      .catch(() => {
        setLoadingButton(false)
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
    textShadow: '2px 2px 20px black'
  };
  
  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  };
  
  const contentStyle = {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center',
    height: '100%',
  };

  return (
    <div style={HomeStyle}>
      <div style={overlayStyle}></div>
      <div style={contentStyle}>
        <h1>Bienvenido, {user.user_name}</h1>
        <DefaultButton
            type="button"
            disabled={loadingButton}
            handleClick={handleLogout}
            content={loading ? <TailSpin stroke="#000000" /> : 'Cerrar Sesión'}
            secondary
          />
        </div>
    </div>
  );
}

export default Home;

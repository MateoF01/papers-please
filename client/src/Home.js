import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BackgroundImage from './background.png';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';
import DefaultButton from './components/button/DefaultButton';
import { AuthContext } from './assets/AuthContext';

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;


function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const { isAuthenticated, handleLogout } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user`, { withCredentials: true });
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        setError('Error al obtener la información del usuario');
        setLoading(false);
      }
    };
    
    // const fetchUser = async () => {
    //   try {
    //     const url = new URL(`${backendUrl}/api/user`)
    //     const response = await fetch(url, {
    //       method: 'GET',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       credentials: 'include',
    //     })
    //     const data = await response.json();
    //     setUser(data);
    //     setLoading(false);
    //   } catch (error) {
    //     setError('Error al obtener la información del usuario');
    //     setLoading(false);
    //   }
    // };
    fetchUser();
  }, [isAuthenticated]);

  const handleLogoutClick = async () => {
    setLoadingButton(true);
    await handleLogout();
    setLoadingButton(false);
    navigate('/');
  };

  const handleCreatePublication = () => {
    navigate('/publication');
  };

  const handleAdminPanel = () => {
    navigate('/posts-to-validate');
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  };

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
        <div style={buttonContainerStyle}>
          <DefaultButton
            type="button"
            disabled={loadingButton}
            handleClick={handleLogoutClick}
            content={loadingButton ? <TailSpin stroke="#000000" /> : 'Cerrar Sesión'}
            secondary
          />
          <DefaultButton
            type="button"
            handleClick={handleCreatePublication}
            content="Crear Publicación"
          />
          {/* Mostrar botón extra si el usuario es administrador */}
          {user.isAdmin === 1 && (
            <DefaultButton
              type="button"
              handleClick={handleAdminPanel}
              content="Panel de Validación"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DefaultButton from './components/button/DefaultButton';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';
import BackgroundImage from './background.png';

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

function NewForum() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Crear objeto de datos
    const forumData = { title, body };

    // Enviar solicitud POST
    axios.post(`${backendUrl}/api/forums`, forumData, {
      withCredentials: true, // Esto se usa si tu backend requiere sesiones de usuario o cookies
      headers: {
        'Content-Type': 'application/json', // Cambiar a 'application/json'
      }
    })
      .then((response) => {
        console.log('Forum created successfully:', response.data);
        setLoading(false);
        navigate('/forums');  // Redirige a la lista de foros
      })
      .catch((error) => {
        setLoading(false);
        console.error('Error creating forum:', error.response?.data || error.message);
        setError(error.response?.data?.error || 'Error al crear el foro. Por favor, inténtalo de nuevo.');
      });
  };

  const ForumStyle = {
    backgroundImage: `url(${BackgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const FormContainerStyle = {
    border: '2px solid #A1DA39',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '30px',
    borderRadius: '10px',
    maxWidth: '600px',
    width: '100%',
  };

  const FormStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  };

  const InputStyle = {
    marginBottom: '20px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '2px solid #A1DA39',
  };

  const ButtonContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px',
  };

  return (
    <div style={ForumStyle}>
      <div style={FormContainerStyle}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Crear Foro</h1>
        <form onSubmit={handleSubmit} style={FormStyle}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del foro"
            required
            style={InputStyle}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Contenido del foro"
            required
            style={{...InputStyle, height: '200px'}}
          />
          <div style={ButtonContainerStyle}>
            <DefaultButton
              type="submit"
              disabled={loading}
              content={loading ? <TailSpin stroke="#000000" /> : 'Crear Foro'}
            />
            <DefaultButton
              type="button"
              handleClick={() => navigate('/forums')}  // Asegúrate de que '/forums' es la ruta donde se listan los foros
              content="Volver"
              secondary
            />
          </div>
        </form>
        {error && <p style={{color: 'red', textAlign: 'center', marginTop: '10px'}}>{error}</p>}
      </div>
    </div>
  );
}

export default NewForum;


import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DefaultButton from './components/button/DefaultButton';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';
import BackgroundImage from './background.png';

function Publication() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(); 
    formData.append('title', title);
    formData.append('body', body);
    if (image) {
      formData.append('image', image); 
    }

    axios.post('http://localhost:8080/api/posts', formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then((response) => {
        console.log('Publication created successfully:', response.data);
        setLoading(false);
        alert('Tu publicación será validada por un moderador pronto.'); 
        navigate('/home');
      })
      .catch((error) => {
        setLoading(false);
        console.error('Error creating publication:', error.response?.data || error.message);
        setError(error.response?.data?.error || 'Error al crear la publicación. Por favor, inténtalo de nuevo.');
      });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); 
  };

  const PublicationStyle = {
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
    border: '1px solid #ccc',
    border: '2px solid #A1DA39',
  };

  const ButtonContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px',
  };

  return (
    <div style={PublicationStyle}>
      <div style={FormContainerStyle}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Crear Publicación</h1>
        <form onSubmit={handleSubmit} style={FormStyle}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            required
            style={InputStyle}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Contenido"
            required
            style={{...InputStyle, height: '200px'}}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={InputStyle}
          />
          <div style={ButtonContainerStyle}>
            <DefaultButton
              type="submit"
              disabled={loading}
              content={loading ? <TailSpin stroke="#000000" /> : 'Publicar'}
            />
            <DefaultButton
              type="button"
              handleClick={() => navigate('/home')}
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

export default Publication;
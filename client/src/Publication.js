import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import DefaultButton from './components/button/DefaultButton';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';
import BackgroundImage from './background.png';

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

function Publication() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [recommendedTag, setRecommendedTag] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/tags`);
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  const handleTagChange = (e) => {
    const selectedTags = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTags(selectedTags);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(); 
    formData.append('title', title);
    formData.append('body', body);
    if (image) {
      formData.append('image', image); 
    }
    formData.append('tags', JSON.stringify(selectedTags));

    try {
      const response = await axios.post(`${backendUrl}/api/posts`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Publication created successfully:', response.data);
      setLoading(false);
      
      await Swal.fire({
        title: 'Publicación creada',
        text: 'Tu publicación será validada por un moderador pronto.',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      
      navigate('/home');
    } catch (error) {
      setLoading(false);
      console.error('Error creating publication:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Error al crear la publicación. Por favor, inténtalo de nuevo.');
      
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.error || 'Error al crear la publicación. Por favor, inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); 
  };

  const handleRecommendTag = async () => {
    if (!recommendedTag) {
      Swal.fire('Error', 'Por favor, ingresa una etiqueta recomendada.', 'error');
      return;
    }

    try {
      await axios.post(`${backendUrl}/api/recommended-tags`, { tag: recommendedTag }, { withCredentials: true });
      Swal.fire('Recomendado', 'Tu etiqueta recomendada ha sido enviada.', 'success');
      setRecommendedTag('');
    } catch (error) {
      console.error('Error recommending tag:', error);
      Swal.fire('Error', 'Error al enviar la etiqueta recomendada. Por favor, inténtalo de nuevo.', 'error');
    }
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
          <select multiple onChange={handleTagChange} style={InputStyle}>
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
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
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ textAlign: 'center', color: '#333' }}>Recomendar Tag</h2>
          <input
            type="text"
            value={recommendedTag}
            onChange={(e) => setRecommendedTag(e.target.value)}
            placeholder="Tag recomendado"
            style={InputStyle}
          />
          <DefaultButton
            type="button"
            handleClick={handleRecommendTag}
            content="Recomendar"
          />
        </div>
      </div>
    </div>
  );
}

export default Publication;
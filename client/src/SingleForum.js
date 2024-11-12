import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import DefaultButton from './components/button/DefaultButton';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';
import BackgroundImage from './background.png';

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

function SingleForum() {
  
  const { id } = useParams();  // Obtener el ID del foro desde la URL
  const navigate = useNavigate();
  
  const [forum, setForum] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener foro y comentarios cuando el componente se monte
  useEffect(() => {
    // Obtener los detalles del foro
    axios.get(`${backendUrl}/api/forums/${id}`)
      .then(response => {
        setForum(response.data);
      })
      .catch(error => {
        console.error('Error fetching forum:', error.response?.data || error.message);
        setError('Error al cargar el foro.');
      });
    
    // Obtener los comentarios del foro
    axios.get(`${backendUrl}/api/forums/${id}/comments`)
      .then(response => {
        setComments(response.data);
      })
      .catch(error => {
        console.error('Error fetching comments:', error.response?.data || error.message);
        setError('Error al cargar los comentarios.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Manejar la publicación de un nuevo comentario
  const handleAddComment = (e) => {
    e.preventDefault();
    setLoading(true);

    // Realizar solicitud POST para agregar un comentario
    axios.post(`${backendUrl}/api/forums/${id}/comments`, { comment: newComment }, { withCredentials: true })
      .then(response => {
        // Después de agregar el comentario, obtener todos los comentarios actualizados
        axios.get(`${backendUrl}/api/forums/${id}/comments`)
          .then(response => {
            setComments(response.data);  // Actualizar los comentarios con la lista completa
            setNewComment('');  // Limpiar el campo de texto
          })
          .catch(error => {
            console.error('Error fetching updated comments:', error.response?.data || error.message);
            setError('Error al cargar los comentarios actualizados.');
          });
      })
      .catch(error => {
        console.error('Error adding comment:', error.response?.data || error.message);
        setError('Error al agregar el comentario.');
      })
      .finally(() => {
        setLoading(false);
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

  const CommentStyle = {
    borderBottom: '1px solid #ccc',
    padding: '10px',
    marginBottom: '10px',
  };

  return (
    <div style={ForumStyle}>
      <div style={FormContainerStyle}>
        {loading ? (
          <TailSpin stroke="#000000" />
        ) : error ? (
          <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
        ) : (
          <>
            <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>{forum.title}</h1>
            <p style={{ textAlign: 'center', fontStyle: 'italic' }}>Por: {forum.user_name}</p>
            <p style={{ marginBottom: '20px' }}>{forum.body}</p>

            <h3>Comentarios:</h3>
            {comments.length === 0 && <p>No hay comentarios aún.</p>}

            <div style={{ marginBottom: '20px' }}>
              {comments.map(comment => (
                <div key={comment.id} style={CommentStyle}>
                  <p><strong>{comment.user_name}:</strong> {comment.body}</p>
                </div>
              ))}
            </div>

            <h3>Agregar comentario</h3>
            <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column' }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu comentario"
                required
                style={{ marginBottom: '20px', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '2px solid #A1DA39', height: '150px' }}
              />
              <DefaultButton
                type="submit"
                disabled={loading || !newComment}
                content={loading ? <TailSpin stroke="#000000" /> : 'Agregar Comentario'}
              />
            </form>
            <div style={{ marginTop: '20px' }}>
              <DefaultButton
                type="button"
                handleClick={() => navigate('/forums')}
                content="Volver a Foros"
                secondary
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SingleForum;

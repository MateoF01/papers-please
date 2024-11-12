import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import DefaultButton from './components/button/DefaultButton';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';
import BackgroundImage from './background.png';

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

function SingleForum() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [forum, setForum] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  useEffect(() => {
    axios.get(`${backendUrl}/api/forums/${id}`)
      .then(response => {
        setForum(response.data);
      })
      .catch(error => {
        console.error('Error fetching forum:', error.response?.data || error.message);
        setError('Error al cargar el foro.');
      });
    
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

  const handleAddComment = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post(`${backendUrl}/api/forums/${id}/comments`, { comment: newComment }, { withCredentials: true })
      .then(response => {
        fetchComments();
        setNewComment('');
      })
      .catch(error => {
        console.error('Error adding comment:', error.response?.data || error.message);
        setError('Error al agregar el comentario.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchComments = () => {
    axios.get(`${backendUrl}/api/forums/${id}/comments`)
      .then(response => {
        setComments(response.data);
      })
      .catch(error => {
        console.error('Error fetching updated comments:', error.response?.data || error.message);
        setError('Error al cargar los comentarios actualizados.');
      });
  };

  const handleEditComment = (commentId) => {
    setEditCommentId(commentId);
    const commentToEdit = comments.find(comment => comment.id === commentId);
    setEditCommentText(commentToEdit.body);
  };

  const handleUpdateComment = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.put(`${backendUrl}/api/forums/${id}/comments/${editCommentId}`, { body: editCommentText }, { withCredentials: true })
      .then(response => {
        fetchComments();
        setEditCommentId(null);
        setEditCommentText('');
      })
      .catch(error => {
        console.error('Error updating comment:', error.response?.data || error.message);
        setError('Error al actualizar el comentario.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('¿Seguro que deseas eliminar este comentario?')) {
      setLoading(true);
      axios.delete(`${backendUrl}/api/forums/${id}/comments/${commentId}`, { withCredentials: true })
        .then(response => {
          fetchComments();
        })
        .catch(error => {
          console.error('Error deleting comment:', error.response?.data || error.message);
          setError('Error al eliminar el comentario.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <div style={{
      backgroundImage: `url(${BackgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        border: '2px solid #A1DA39',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '30px',
        borderRadius: '10px',
        maxWidth: '600px',
        width: '100%',
      }}>
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
                <div key={comment.id} style={{
                  borderBottom: '1px solid #ccc',
                  padding: '10px',
                  marginBottom: '10px',
                }}>
                  {editCommentId === comment.id ? (
                    <form onSubmit={handleUpdateComment}>
                      <textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        required
                        style={{ width: '100%', height: '100px', marginBottom: '10px' }}
                      />
                      <DefaultButton type="submit" content="Guardar cambios" />
                      <DefaultButton type="button" content="Cancelar" handleClick={() => setEditCommentId(null)} />
                    </form>
                  ) : (
                    <>
                      <p><strong>{comment.user_name}:</strong> {comment.body}</p>
                      <DefaultButton content="Editar" handleClick={() => handleEditComment(comment.id)} />
                      <DefaultButton content="Eliminar" handleClick={() => handleDeleteComment(comment.id)} />
                    </>
                  )}
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

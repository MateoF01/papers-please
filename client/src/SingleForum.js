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
  const [editingForum, setEditingForum] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [forumTitle, setForumTitle] = useState('');
  const [forumBody, setForumBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar foro y comentarios
  useEffect(() => {
    axios.get(`${backendUrl}/api/forums/${id}`)
      .then(response => {
        setForum(response.data);
        setForumTitle(response.data.title);
        setForumBody(response.data.body);
      })
      .catch(error => {
        setError('Error al cargar el foro.');
      });

    axios.get(`${backendUrl}/api/forums/${id}/comments`)
      .then(response => {
        setComments(response.data);
      })
      .catch(error => {
        setError('Error al cargar los comentarios.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Agregar comentario
  const handleAddComment = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post(`${backendUrl}/api/forums/${id}/comments`, { comment: newComment }, { withCredentials: true })
      .then(response => {
        setComments([...comments, response.data]);
        setNewComment('');
      })
      .catch(error => {
        setError('Error al agregar el comentario.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Editar foro
  const handleEditForum = () => {
    axios.put(`${backendUrl}/api/forums/${id}`, { title: forumTitle, body: forumBody }, { withCredentials: true })
      .then(() => {
        setEditingForum(false);
        setForum(prev => ({ ...prev, title: forumTitle, body: forumBody }));
      })
      .catch(error => {
        setError('Error al actualizar el foro.');
      });
  };

  // Eliminar foro
  const handleDeleteForum = () => {
    axios.delete(`${backendUrl}/api/forums/${id}`, { withCredentials: true })
      .then(() => {
        navigate('/forums');
      })
      .catch(error => {
        setError('Error al eliminar el foro.');
      });
  };

  // Editar comentario
  const handleEditComment = (commentId, updatedComment) => {
    axios.put(`${backendUrl}/api/forums/${id}/comments/${commentId}`, { body: updatedComment }, { withCredentials: true })
      .then(() => {
        setComments(comments.map(comment => comment.id === commentId ? { ...comment, body: updatedComment } : comment));
        setEditingCommentId(null);
      })
      .catch(error => {
        setError('Error al actualizar el comentario.');
      });
  };

  // Eliminar comentario
  const handleDeleteComment = (commentId) => {
    axios.delete(`${backendUrl}/api/forums/${id}/comments/${commentId}`, { withCredentials: true })
      .then(() => {
        setComments(comments.filter(comment => comment.id !== commentId));
      })
      .catch(error => {
        setError('Error al eliminar el comentario.');
      });
  };

  return (
    <div style={{
      backgroundImage: `url(${BackgroundImage})`,
      backgroundSize: 'cover',
      minHeight: '100vh',
      display: 'flex',
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
            {editingForum ? (
              <>
                <input
                  type="text"
                  value={forumTitle}
                  onChange={(e) => setForumTitle(e.target.value)}
                  style={{ marginBottom: '10px', padding: '5px' }}
                />
                <textarea
                  value={forumBody}
                  onChange={(e) => setForumBody(e.target.value)}
                  style={{ marginBottom: '10px', padding: '5px' }}
                />
                <DefaultButton content="Guardar" handleClick={handleEditForum} />
                <DefaultButton content="Cancelar" handleClick={() => setEditingForum(false)} />
              </>
            ) : (
              <>
                <h1>{forum.title}</h1>
                <p>{forum.body}</p>
                <DefaultButton content="Editar Foro" handleClick={() => setEditingForum(true)} />
                <DefaultButton content="Eliminar Foro" handleClick={handleDeleteForum} />
              </>
            )}

            <h3>Comentarios:</h3>
            {comments.map(comment => (
              <div key={comment.id} style={{ borderBottom: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                {editingCommentId === comment.id ? (
                  <>
                    <textarea
                      value={comment.body}
                      onChange={(e) => handleEditComment(comment.id, e.target.value)}
                      style={{ marginBottom: '10px', padding: '5px' }}
                    />
                    <DefaultButton content="Guardar" handleClick={() => handleEditComment(comment.id, comment.body)} />
                    <DefaultButton content="Cancelar" handleClick={() => setEditingCommentId(null)} />
                  </>
                ) : (
                  <>
                    <p><strong>{comment.user_name}:</strong> {comment.body}</p>
                    <DefaultButton content="Editar" handleClick={() => setEditingCommentId(comment.id)} />
                    <DefaultButton content="Eliminar" handleClick={() => handleDeleteComment(comment.id)} />
                  </>
                )}
              </div>
            ))}

            <h3>Agregar comentario</h3>
            <form onSubmit={handleAddComment}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu comentario"
                required
                style={{ marginBottom: '10px', padding: '10px' }}
              />
              <DefaultButton content="Agregar Comentario" type="submit" />
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default SingleForum;

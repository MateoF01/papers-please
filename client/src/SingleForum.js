import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import DefaultButton from './components/button/DefaultButton';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';
import styled from 'styled-components';
import BackgroundImage from './background.png';
import { Edit, Trash } from 'lucide-react';
import Swal from 'sweetalert2';


const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

const PageContainer = styled.div`
  background-image: url(${BackgroundImage});
  background-size: cover;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ForumContainer = styled.div`
  border: 2px solid #A1DA39;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 30px;
  border-radius: 10px;
  max-width: 600px;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const CommentSection = styled.div`
  margin-top: 20px;
`;

const CommentItem = styled.div`
  border-bottom: 1px solid #ccc;
  padding: 10px 0;
  margin-bottom: 10px;
`;

const DefaultButtonStyled = styled(DefaultButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  
  &.edit {
    background-color: #4CAF50;
    color: white;
  }

  &.delete {
    background-color: #dc3545;
    color: white;
  }

  &.add {
    background-color: #007bff;
    color: white;
  }
`;


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
  const [currentUser, setCurrentUser] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [forumResponse, commentsResponse, userResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/forums/${id}`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/forums/${id}/comments`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/user`, { withCredentials: true })
        ]);

        setForum(forumResponse.data);
        setForumTitle(forumResponse.data.title);
        setForumBody(forumResponse.data.body);
        setComments(commentsResponse.data);
        setCurrentUser(userResponse.data);

      } catch (error) {
        setError('Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
        window.location.reload();
      });
    
  };

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

  const handleDeleteForum = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el foro de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        await axios.delete(`${backendUrl}/api/forums/${id}`, { withCredentials: true });
        Swal.fire('Eliminado', 'El foro ha sido eliminado.', 'success');
        navigate('/forums');
      } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error.message);
        Swal.fire('Error', 'Error al eliminar el foro.', 'error');
      }
    }
  };

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

  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el comentario de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        await axios.delete(`${backendUrl}/api/forums/${id}/comments/${commentId}`, {
          withCredentials: true,
          data: { isAdmin: currentUser.isAdmin }
        });
        setComments(comments.filter(comment => comment.id !== commentId));
        Swal.fire('Eliminado', 'El comentario ha sido eliminado.', 'success');
      } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error.message);
        Swal.fire('Error', 'Error al eliminar el comentario.', 'error');
      }
    }
  };

  const handleEditCommentChange = (e) => {
    setEditedCommentText(e.target.value);
  };

  const handleSaveEditedComment = (commentId) => {
    handleEditComment(commentId, editedCommentText);
  };

  const isAdmin = currentUser && currentUser.isAdmin === 1;
  const isForumOwner = currentUser && currentUser.id === forum?.user_id;

  return (
    <PageContainer>
      <ForumContainer>
        {loading ? (
          <TailSpin stroke="#000000" />
        ) : error ? (
          <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
        ) : (
          <>
            {editingForum ? (
              <>
                <Input
                  type="text"
                  value={forumTitle}
                  onChange={(e) => setForumTitle(e.target.value)}
                />
                <Textarea
                  value={forumBody}
                  onChange={(e) => setForumBody(e.target.value)}
                  rows={5}
                />
                <ButtonGroup>
                  <DefaultButtonStyled content="Guardar" handleClick={handleEditForum} />
                  <DefaultButtonStyled content="Cancelar" handleClick={() => setEditingForum(false)} />
                </ButtonGroup>
              </>
            ) : (
              <>
                <h1>{forum.title}</h1>
                <p>{forum.body}</p>
                <ButtonGroup>
                  {isForumOwner && (
                    <DefaultButtonStyled content={<Edit size={18} />} handleClick={() => setEditingForum(true)} />
                  )}
                  {(isAdmin || isForumOwner) && (
                    <DefaultButtonStyled content={<Trash size={18} />} handleClick={handleDeleteForum} />
                  )}
                </ButtonGroup>
              </>
            )}

            <CommentSection>
              <h3>Comentarios:</h3>
              {comments.map(comment => (
                <CommentItem key={comment.id}>
                  {editingCommentId === comment.id ? (
                    <>
                      <Textarea
                        value={editedCommentText}
                        onChange={handleEditCommentChange}
                        rows={3}
                      />
                      <ButtonGroup>
                        <DefaultButtonStyled content="Guardar" handleClick={() => handleSaveEditedComment(comment.id)} />
                        <DefaultButtonStyled content="Cancelar" handleClick={() => setEditingCommentId(null)} />
                      </ButtonGroup>
                    </>
                  ) : (
                    <>
                      <p><strong>{comment.user_name}:</strong> {comment.body}</p> 
                      <p style={{ fontSize: '0.8em', color: 'gray' }}>{comment.created_at}</p>
                      <ButtonGroup>
                        {currentUser.id === comment.user_id && (
                          <DefaultButtonStyled content={<Edit size={18} />} handleClick={() => {
                            setEditingCommentId(comment.id);
                            setEditedCommentText(comment.body);
                          }} />
                        )}
                        {(currentUser.id === comment.user_id || isAdmin) && (
                          <DefaultButtonStyled content={<Trash size={18} />} handleClick={() => handleDeleteComment(comment.id)} />
                        )}
                      </ButtonGroup>
                    </>
                  )}
                </CommentItem>
              ))}
            </CommentSection>

            <h3>Agregar comentario</h3>
            <form onSubmit={handleAddComment}>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu comentario"
                required
                rows={4}
              />
              <DefaultButtonStyled content="Agregar Comentario" type="submit" />
            </form>
          </>
        )}
      </ForumContainer>
    </PageContainer>
  );
}

export default SingleForum;
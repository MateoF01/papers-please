import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import DefaultButton from './components/button/DefaultButton';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';
import styled from 'styled-components';
import BackgroundImage from './background.png';
import { Star, Edit, Trash } from 'lucide-react';

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

const RootContainer = styled.div`
  background-image: url(${BackgroundImage});
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ForumContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  border: 2px solid #A1DA39;
`;

const ForumTitle = styled.h1`
  margin-bottom: 20px;
  color: #333;
`;

const ForumBody = styled.p`
  color: #666;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  margin-top: 20px;
`;

const CommentSection = styled.div`
  margin-top: 30px;
`;

const CommentItem = styled.div`
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
`;

const CommentText = styled.p`
  margin: 5px 0;
`;

const AddCommentForm = styled.form`
  margin-top: 20px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  resize: vertical;
  margin-bottom: 10px;
`;

const CommentButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const DefaultButtonStyled = styled(DefaultButton)`
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

const StarRating = styled.div`
  display: flex;
  gap: 5px;
`;

const SingleForum = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [forumResponse, commentsResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/forums/${id}`),
          axios.get(`${backendUrl}/api/forums/${id}/comments`),
        ]);

        setForum(forumResponse.data);
        setForumTitle(forumResponse.data.title);
        setForumBody(forumResponse.data.body);
        setComments(commentsResponse.data);
      } catch (error) {
        setError('Error al cargar el foro o los comentarios.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddComment = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(
        `${backendUrl}/api/forums/${id}/comments`,
        { comment: newComment },
        { withCredentials: true }
      )
      .then((response) => {
        setComments([...comments, response.data]);
        setNewComment('');
      })
      .catch(() => {
        setError('Error al agregar el comentario.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEditForum = () => {
    axios
      .put(
        `${backendUrl}/api/forums/${id}`,
        { title: forumTitle, body: forumBody },
        { withCredentials: true }
      )
      .then(() => {
        setEditingForum(false);
        setForum((prev) => ({ ...prev, title: forumTitle, body: forumBody }));
      })
      .catch(() => {
        setError('Error al actualizar el foro.');
      });
  };

  const handleDeleteForum = () => {
    axios
      .delete(`${backendUrl}/api/forums/${id}`, { withCredentials: true })
      .then(() => {
        navigate('/forums');
      })
      .catch(() => {
        setError('Error al eliminar el foro.');
      });
  };

  const handleEditComment = (commentId, updatedComment) => {
    axios
      .put(
        `${backendUrl}/api/forums/${id}/comments/${commentId}`,
        { body: updatedComment },
        { withCredentials: true }
      )
      .then(() => {
        setComments(
          comments.map((comment) =>
            comment.id === commentId ? { ...comment, body: updatedComment } : comment
          )
        );
        setEditingCommentId(null);
      })
      .catch(() => {
        setError('Error al actualizar el comentario.');
      });
  };

  const handleDeleteComment = (commentId) => {
    axios
      .delete(`${backendUrl}/api/forums/${id}/comments/${commentId}`, { withCredentials: true })
      .then(() => {
        setComments(comments.filter((comment) => comment.id !== commentId));
      })
      .catch(() => {
        setError('Error al eliminar el comentario.');
      });
  };

  return (
    <RootContainer>
      <ForumContainer>
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
                <Textarea
                  value={forumBody}
                  onChange={(e) => setForumBody(e.target.value)}
                  style={{ marginBottom: '10px', padding: '5px' }}
                />
                <DefaultButtonStyled content="Guardar" className="edit" handleClick={handleEditForum} />
                <DefaultButtonStyled content="Cancelar" handleClick={() => setEditingForum(false)} />
              </>
            ) : (
              <>
                <ForumTitle>{forum.title}</ForumTitle>
                <ForumBody>{forum.body}</ForumBody>
                <ButtonGroup>
                  <DefaultButtonStyled content="Editar Foro" className="edit" handleClick={() => setEditingForum(true)} />
                  <DefaultButtonStyled content="Eliminar Foro" className="delete" handleClick={handleDeleteForum} />
                </ButtonGroup>
              </>
            )}

            <CommentSection>
              <h3>Comentarios:</h3>
              {comments.map((comment) => (
                <CommentItem key={comment.id}>
                  {editingCommentId === comment.id ? (
                    <>
                      <Textarea
                        value={comment.body}
                        onChange={(e) => handleEditComment(comment.id, e.target.value)}
                        style={{ marginBottom: '10px', padding: '5px' }}
                      />
                      <CommentButtonGroup>
                        <DefaultButtonStyled content="Guardar" className="edit" handleClick={() => handleEditComment(comment.id, comment.body)} />
                        <DefaultButtonStyled content="Cancelar" handleClick={() => setEditingCommentId(null)} />
                      </CommentButtonGroup>
                    </>
                  ) : (
                    <>
                      <CommentText>
                        <strong>{comment.user_name}:</strong> {comment.body}
                      </CommentText>
                      <CommentButtonGroup>
                        <DefaultButtonStyled content="Editar" className="edit" handleClick={() => setEditingCommentId(comment.id)} />
                        <DefaultButtonStyled content="Eliminar" className="delete" handleClick={() => handleDeleteComment(comment.id)} />
                      </CommentButtonGroup>
                    </>
                  )}
                </CommentItem>
              ))}
            </CommentSection>

            <AddCommentForm onSubmit={handleAddComment}>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu comentario..."
                required
              />
              <DefaultButtonStyled content="Agregar Comentario" className="add" type="submit" />
            </AddCommentForm>
          </>
        )}
      </ForumContainer>
    </RootContainer>
  );
};

export default SingleForum;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import backgroundImage from './background.png';
import { Star, Edit, Trash } from 'lucide-react';
import Swal from 'sweetalert2';


const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

const RootContainer = styled.div`
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
`;

const PostContainer = styled.div`
  padding: 80px 20px 20px 20px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const PostContent = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
`;

const PostTitle = styled.h1`
  margin: 0 0 20px 0;
  color: #333;
`;

const PostMeta = styled.div`
  color: #666;
  font-size: 0.9em;
  margin-bottom: 20px;
`;

const PostBody = styled.div`
  line-height: 1.6;
  color: #333;
`;

const PostImage = styled.img`
  max-width: 100%;
  border-radius: 8px;
  margin-bottom: 20px;
`;
const InputStyle = {
  marginBottom: '20px',
  padding: '10px',
  fontSize: '16px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};
const Button = styled.button`
  padding: 8px 16px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &.edit {
    background-color: #4CAF50;
    color: white;
  }
  
  &.delete {
    background-color: #dc3545;
    color: white;
  }

  &.validate {
    background-color: #28a745;
    color: white;
  }
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Textarea = styled.textarea`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 150px;
  resize: none;
`;

const AdminName = styled.span`
  color: #28a745;
  font-weight: bold;
`;

const ReviewSection = styled.div`
  margin-top: 30px;
`;

const ReviewForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const StarRating = styled.div`
  display: flex;
  gap: 5px;
`;

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ReviewItem = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 8px;
`;

const Tag = styled.span`
  background-color: #e0e0e0;
  color: #333;
  border-radius: 5px;
  padding: 5px 10px;
  margin-right: 5px;
  display: inline-block;
`;

export default function SinglePost() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [editedImage, setEditedImage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedRating, setEditedRating] = useState(0);
  const [editedComment, setEditedComment] = useState('');
  
  
  

  const handleTagChange = (e) => {
    const selectedTags = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTags(selectedTags);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        const [postResponse, userResponse, reviewsResponse, tagsResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/posts/${id}`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/user`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/posts/${id}/reviews`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/tags`)
        ]);
  
        setPost(postResponse.data);
        setEditedTitle(postResponse.data.title);
        setEditedBody(postResponse.data.body);
        setCurrentUser(userResponse.data);
        setReviews(reviewsResponse.data);
        setTags(tagsResponse.data);
        setSelectedTags(postResponse.data.tags.map(tag => tag.toString())); // Initialize selectedTags
  
        setHasUserReviewed(reviewsResponse.data.some(review => review.user_id === userResponse.data.id));
  
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar la publicación y las reseñas');
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);

  const handleEdit = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Vas a editar esta publicación. Los cambios deberán ser validados por un moderador.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setIsEditing(true);
    }
  };


  const handleImageChange = (e) => {
    setEditedImage(e.target.files[0]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
  
    try {
      const formData = new FormData();
      formData.append('title', editedTitle);
      formData.append('body', editedBody);
      if (editedImage) {
        formData.append('image', editedImage);
      }
      formData.append('tags', JSON.stringify(selectedTags)); // Ensure tags are sent as a JSON string
  
      await axios.put(`${backendUrl}/api/posts/${id}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      const response = await axios.get(`${backendUrl}/api/posts/${id}`, { withCredentials: true });
  
      setPost(response.data);
      setIsEditing(false);
  
      // Show alert after successful edit
      await Swal.fire({
        title: 'Publicación actualizada',
        text: 'Los cambios de la publicación serán validados por un moderador.',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
    } catch (err) {
      setError('Error al actualizar la publicación');
      Swal.fire({
        title: 'Error',
        text: 'Error al actualizar la publicación. Por favor, inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la publicación de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        await axios.delete(`${backendUrl}/api/posts/${id}`, {
          withCredentials: true,
          data: { isAdmin: currentUser.isAdmin }
        });
        Swal.fire('Eliminado', 'La publicación ha sido eliminada.', 'success');
        navigate(-1);
      } catch (err) {
        console.error('Error details:', err.response ? err.response.data : err.message);
        Swal.fire('Error', 'Error al eliminar la publicación.', 'error');
      }
    }
  };

  const handleValidate = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción validará la publicación.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, validar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`${backendUrl}/api/posts/${id}/validate`, {}, {
          withCredentials: true
        });
        setPost({ ...post, validated: 1 });
        Swal.fire('Validado', 'La publicación ha sido validada.', 'success');
        navigate(-1);
      } catch (err) {
        console.error('Error validating the post:', err);
        Swal.fire('Error', 'Error al validar la publicación.', 'error');
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (hasUserReviewed) {
      alert('You have already submitted a review for this post.');
      return;
    }
  
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Vas a enviar esta reseña, será verificada por un administrador.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        const response = await axios.post(`${backendUrl}/api/posts/${id}/reviews`, {
          rating: userRating,
          comment: userComment
        }, {
          withCredentials: true
        });
        const newReview = {
          ...response.data,
          user_name: currentUser.user_name
        };
        setReviews([newReview, ...reviews]);
        setUserRating(0);
        setUserComment('');
        setHasUserReviewed(true);
        Swal.fire('Enviado', 'Tu reseña ha sido enviada.', 'success');
      } catch (err) {
        console.error('Error submitting review:', err);
        Swal.fire('Error', 'Error al enviar la reseña. Por favor, inténtalo de nuevo.', 'error');
      }
    }
  };

  const handleEditReview = async (review) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Vas a editar esta reseña, será verificada por un administrador.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      setEditingReviewId(review.id);
      setEditedRating(review.rating);
      setEditedComment(review.comment);
    }
  };

  const handleSaveReview = async (reviewId) => {
    try {
      await axios.put(`${backendUrl}/api/reviews/${reviewId}/unvalidate`, {}, {
        withCredentials: true
      });
      await axios.put(`${backendUrl}/api/reviews/${reviewId}`, {
        rating: editedRating,
        comment: editedComment
      }, {
        withCredentials: true
      });
      const updatedReviews = reviews.map(review => 
        review.id === reviewId ? { ...review, rating: editedRating, comment: editedComment, validated: 0 } : review
      );
      setReviews(updatedReviews);
      setEditingReviewId(null);
    } catch (err) {
      console.error('Error updating review:', err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const result = await Swal.fire({
      title: 'Estas seguro?',
      text: 'Esta acción eliminará la reseña de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        await axios.delete(`${backendUrl}/api/reviews/${reviewId}`, {
          withCredentials: true
        });
        Swal.fire('Eliminado', 'La reseña ha sido eliminada.', 'success');
        setReviews(reviews.filter((review) => review.id !== reviewId));
        window.location.reload(); // Refresh the page
      } catch (err) {
        console.error('Error deleting review:', err);
        Swal.fire('Error', 'Error al eliminar la reseña.', 'error');
      }
    }
  };


  if (loading) return (
    <>
      <RootContainer />
      <PostContainer>
        <PostContent>
          <p>Cargando...</p>
        </PostContent>
      </PostContainer>
    </>
  );

  if (error) return (
    <>
      <RootContainer />
      <PostContainer>
        <PostContent>
          <p>{error}</p>
          {errorDetails && <p>Details: {errorDetails}</p>}
        </PostContent>
      </PostContainer>
    </>
  );

  if (!post) return (
    <>
      <RootContainer />
      <PostContainer>
        <PostContent>
          <PostTitle>Publicación no encontrada</PostTitle>
          <p>La publicación que buscas no existe o ha sido eliminada.</p>
          <Button onClick={() => navigate('/posts')}>Volver a la lista de publicaciones</Button>
        </PostContent>
      </PostContainer>
    </>
  );

  const isAdmin = currentUser && currentUser.isAdmin === 1;
  const isPostOwner = currentUser && currentUser.id === post.user_id;
  const canEdit = isPostOwner;
  const canDelete = isAdmin || isPostOwner;
  const canValidate = isAdmin && post.validated === 0;
  const canReview = !isPostOwner && !hasUserReviewed && post.validated === 1;

  const renderAuthorName = () => {
    if (post.user_isAdmin === 1) {
      return <AdminName>{post.user_name} (admin)</AdminName>;
    }
    return post.user_name;
  };


  const renderTags = (postTags) => {
    return postTags.map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return <Tag key={tagId}>{tag ? tag.name : tagId}</Tag>;
    });
  };

  return (
    <>
      <RootContainer />
      <PostContainer>
        <PostContent>
          {isEditing ? (
            <EditForm onSubmit={handleSave}>
              <Input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Título"
                required
              />
              <Textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                placeholder="Contenido"
                required
              />
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <select multiple value={selectedTags} onChange={handleTagChange} style={InputStyle}>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
              <div>
                <Button type="submit" className="edit">Guardar</Button>
                <Button type="button" onClick={() => setIsEditing(false)}>Cancelar</Button>
              </div>
            </EditForm>
          ) : (
            <>
              <PostTitle>{post.title}</PostTitle>
              <PostMeta>
                Por {renderAuthorName()} • {new Date(post.created_at).toLocaleDateString()} • {renderTags(post.tags)}
              </PostMeta>
              {post.image && <PostImage src={`${backendUrl}${post.image}`} alt="Imagen de la publicación" />}
              <PostBody>{post.body}</PostBody>
              <div style={{ marginTop: '20px' }}>
                {canEdit && <Button className="edit" onClick={handleEdit}>Editar</Button>}
                {canValidate && <Button className="validate" onClick={handleValidate}>Validar</Button>}
                {canDelete && <Button className="delete" onClick={handleDelete}>Eliminar</Button>}
              </div>
              {post.validated === 1 && (
                <ReviewSection>
                  <h2>Reseñas</h2>
                  {canReview ? (
                    <ReviewForm onSubmit={handleSubmitReview}>
                      <StarRating>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            onClick={() => setUserRating(star)}
                            fill={star <= userRating ? '#FFD700' : 'none'}
                            stroke={star <= userRating ? '#FFD700' : '#000'}
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                      </StarRating>
                      <Textarea
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Escribir reseña..."
                      />
                      <Button type="submit" className="edit">Publicar reseña</Button>
                    </ReviewForm>
                  ) : (
                    <p>{isPostOwner ? "No puedes hacer una reseña en una publicación propia." : "Ya realizaste una reseña."}</p>
                  )}
                  <ReviewList>
                    {reviews.filter(review => review.validated === 1).map((review) => (
                      <ReviewItem key={review.id}>
                        {editingReviewId === review.id ? (
                          <form onSubmit={(e) => { e.preventDefault(); handleSaveReview(review.id); }}>
                            <StarRating>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  onClick={() => setEditedRating(star)}
                                  fill={star <= editedRating ? '#FFD700' : 'none'}
                                  stroke={star <= editedRating ? '#FFD700' : '#000'}
                                  style={{ cursor: 'pointer' }}
                                />
                              ))}
                            </StarRating>
                            <Textarea
                              value={editedComment}
                              onChange={(e) => setEditedComment(e.target.value)}
                            />
                            <Button type="submit" className="edit">Save</Button>
                            <Button type="button" onClick={() => setEditingReviewId(null)}>Cancel</Button>
                          </form>
                        ) : (
                          <>
                            <p>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  fill={star <= review.rating ? '#FFD700' : 'none'}
                                  stroke={star <= review.rating ? '#FFD700' : '#000'}
                                />
                              ))}
                            </p>
                            <p>{review.comment}</p>
                            <PostMeta>
                              Por {review.user_name} • {new Date(review.created_at).toLocaleDateString()}
                            </PostMeta>
                            <div>
                              {currentUser.id === review.user_id && (
                                <>
                                  <Button onClick={() => handleEditReview(review)}><Edit size={16} /></Button>
                                  <Button onClick={() => handleDeleteReview(review.id)}><Trash size={16} /></Button>
                                </>
                              )}
                              {currentUser.isAdmin && currentUser.id !== review.user_id ? (
                                <Button onClick={() => handleDeleteReview(review.id)}><Trash size={16} /></Button>
                              ) : null}
                            </div>
                          </>
                        )}
                      </ReviewItem>
                    ))}
                  </ReviewList>
                </ReviewSection>
              )}
            </>
          )}
        </PostContent>
      </PostContainer>
    </>
  );
}
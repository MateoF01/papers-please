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

export default function SinglePost() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [tags, setTags] = useState([]);
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
    setTags(selectedTags);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [postResponse, userResponse, reviewsResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/posts/${id}`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/user`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/posts/${id}/reviews`, { withCredentials: true })
        ]);

        setPost(postResponse.data);
        setEditedTitle(postResponse.data.title);
        setEditedBody(postResponse.data.body);
        setCurrentUser(userResponse.data);
        setReviews(reviewsResponse.data);

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleImageChange = (e) => {
    setEditedImage(e.target.files[0]);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {


      await axios.put(`${backendUrl}/api/posts/${id}`, 
      {
        title: editedTitle,
        body: editedBody,
        image: editedImage ? editedImage : '',
        tags: tags
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const response = await axios.get(`${backendUrl}/api/posts/${id}`, { withCredentials: true });
            
      setPost(response.data);
      setIsEditing(false);
    } catch (err) {
      setError('Error al actualizar la publicación');
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
    try {
      await axios.put(`${backendUrl}/api/posts/${id}/validate`, {}, {
        withCredentials: true
      });
      setPost({ ...post, validated: 1 });
      navigate(-1);
    } catch (err) {
      setError('Error al validar la publicación');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (hasUserReviewed) {
      alert('You have already submitted a review for this post.');
      return;
    }
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
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditedRating(review.rating);
    setEditedComment(review.comment);
  };

  const handleSaveReview = async (reviewId) => {
    try {
      await axios.put(`${backendUrl}/api/reviews/${reviewId}`, {
        rating: editedRating,
        comment: editedComment
      }, {
        withCredentials: true
      });
      const updatedReviews = reviews.map(review => 
        review.id === reviewId ? { ...review, rating: editedRating, comment: editedComment } : review
      );
      setReviews(updatedReviews);
      setEditingReviewId(null);
    } catch (err) {
      console.error('Error updating review:', err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Esta acción eliminará la reseña de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });
  
    if (result.isConfirmed) {
      try {
        await axios.delete(`${backendUrl}/api/reviews/${reviewId}`, {
          withCredentials: true
        });
        Swal.fire('Eliminado', 'La reseña ha sido eliminada.', 'success');
        setReviews(reviews.filter((review) => review.id !== reviewId));
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


  const renderTags = (tags) => {
    const tagNames = {
      0: 'Matemática',
      1: 'Ciencia',
      2: 'Filosofía',
      3: 'Historia',
      4: 'Literatura',
      5: 'Tecnología',
      6: 'Arte',
      7: 'Política',
      8: 'Economía',
      9: 'Psicología'
    };
    return tags.map(tagId => <span key={tagId} className="tag">{tagNames[tagId]}</span>);
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
              />
              <Textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
              />


              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              <select multiple onChange={handleTagChange} style={InputStyle}>
                  <option value="0">Matemática</option>
                  <option value="1">Ciencia</option>
                  <option value="2">Filosofía</option>
                  <option value="3">Historia</option>
                  <option value="4">Literatura</option>
                  <option value="5">Tecnología</option>
                  <option value="6">Arte</option>
                  <option value="7">Política</option>
                  <option value="8">Economía</option>
                  <option value="9">Psicología</option>
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
                    {reviews.map((review) => (
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
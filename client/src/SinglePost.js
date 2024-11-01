import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import backgroundImage from './background.png';
import { Star } from 'lucide-react';

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
  const [editedImage, setEditedImage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [postResponse, userResponse, reviewsResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/posts/${id}`, { withCredentials: true }),
          axios.get(`http://localhost:8080/api/user`, { withCredentials: true }),
          axios.get(`http://localhost:8080/api/posts/${id}/reviews`, { withCredentials: true })
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
  
    const formData = new FormData();
    formData.append('title', editedTitle);
    formData.append('body', editedBody);
    if (editedImage) {
      formData.append('image', editedImage);
    }
  
    try {
      await axios.put(`http://localhost:8080/api/posts/${id}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const response = await axios.get(`http://localhost:8080/api/posts/${id}`, { withCredentials: true });
      setPost(response.data);
      setIsEditing(false);
    } catch (err) {
      setError('Error al actualizar la publicación');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      try {
        await axios.delete(`http://localhost:8080/api/posts/${id}`, {
          withCredentials: true,
          data: { isAdmin: currentUser.isAdmin }
        });
        navigate(-1);
      } catch (err) {
        console.error('Error details:', err.response ? err.response.data : err.message);
        setError('Error al eliminar la publicación');
        setErrorDetails(err.response ? err.response.data : err.message);
      }
    }
  };

  const handleValidate = async () => {
    try {
      await axios.put(`http://localhost:8080/api/posts/${id}/validate`, {}, {
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
      const response = await axios.post(`http://localhost:8080/api/posts/${id}/reviews`, {
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
  const canReview = !isPostOwner && !hasUserReviewed;

  const renderAuthorName = () => {
    if (post.user_isAdmin === 1) {
      return <AdminName>{post.user_name} (admin)</AdminName>;
    }
    return post.user_name;
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
              <div>
                <Button type="submit" className="edit">Guardar</Button>
                <Button type="button" onClick={() => setIsEditing(false)}>Cancelar</Button>
              </div>
            </EditForm>
          ) : (
            <>
              <PostTitle>{post.title}</PostTitle>
              <PostMeta>
                Por {renderAuthorName()} • {new Date(post.created_at).toLocaleDateString()}
              </PostMeta>
              {post.image && <PostImage src={`http://localhost:8080${post.image}`} alt="Imagen de la publicación" />}
              <PostBody>{post.body}</PostBody>
              <div style={{ marginTop: '20px' }}>
                {canEdit && <Button className="edit" onClick={handleEdit}>Editar</Button>}
                {canValidate && <Button className="validate" onClick={handleValidate}>Validar</Button>}
                {canDelete && <Button className="delete" onClick={handleDelete}>Eliminar</Button>}
              </div>

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
                    </ReviewItem>
                  ))}
                </ReviewList>
              </ReviewSection>
            </>
          )}
        </PostContent>
      </PostContainer>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import { AlertCircle, Check, X, ChevronDown, ChevronUp, Star } from 'lucide-react';
import backgroundImage from './background.png';

const RootContainer = styled.div`
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
`;

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 80px 20px;
`;

const Container = styled.div`
  width: 100%;
  max-width: 800px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
`;

const SortButton = styled.button`
  background: #f0f0f0;
  border: none;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    background: #e0e0e0;
  }

  svg {
    margin-left: 5px;
  }
`;

const FormContainer = styled.div`
  margin-bottom: 30px;
`;

const Form = styled.form`
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #45a049;
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.h2`
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.5rem;
`;

const Meta = styled.div`
  color: #666;
  font-size: 0.9em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-top: 15px;
`;

const ActionButton = styled(Button)`
  padding: 8px 15px;
  font-size: 0.9rem;
`;

const ValidateButton = styled(ActionButton)`
  background-color: #28a745;

  &:hover {
    background-color: #218838;
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: #dc3545;

  &:hover {
    background-color: #c82333;
  }
`;

const Error = styled.div`
  color: #dc3545;
  padding: 10px;
  background-color: #f8d7da;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const ValidationMessage = styled.div`
  color: #856404;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #007bff;
  transition: color 0.3s ease;

  &:hover {
    color: #0056b3;
    text-decoration: underline;
  }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
`;

const TagItem = styled.div`
  background-color: #e9ecef;
  color: #495057;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const TagName = styled.span``;

const DeleteTagButton = styled.button`
  background-color: transparent;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;

  &:hover {
    color: #dc3545;
  }
`;

const ReviewCard = styled(Card)`
  background-color: #f8f9fa;
`;

const ReviewContent = styled.p`
  margin: 10px 0;
  font-style: italic;
`;

const ReviewRating = styled.span`
  font-weight: bold;
  color: #f39c12;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
`;


const StyledCheck = styled(Check)`
  &:hover {
    color: green;
  }
`;

const TagButtonContainer = styled.div`
  display: flex;
  gap: 8px; /* Adjust the gap between buttons as needed */
`;

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

export default function PostListToValidate() {
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentUser, setCurrentUser] = useState(null);
  const [orderBy, setOrderBy] = useState('created_at');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);
  const [recommendedTags, setRecommendedTags] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsResponse, userResponse, tagsResponse, recommendedTagsResponse, reviewsResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/posts/to-validate`, {params: {orderBy, order: sortOrder}, withCredentials: true }),
          axios.get(`${backendUrl}/api/user`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/tags`),
          axios.get(`${backendUrl}/api/recommended-tags`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/reviews/unvalidated`, { withCredentials: true })
        ]);
        setPosts(postsResponse.data);
        setCurrentUser(userResponse.data);
        setTags(tagsResponse.data);
        setRecommendedTags(recommendedTagsResponse.data);
        setReviews(reviewsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading data');
        setLoading(false);
      }
    };

    fetchData();
  }, [orderBy, sortOrder]);

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción añadirá una nueva etiqueta.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, añadir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(`${backendUrl}/api/tags`, { tagName: newTag });
        setTags([...tags, response.data.tag]);
        setNewTag('');
        Swal.fire('Añadido', 'La etiqueta ha sido añadida.', 'success');
      } catch (error) {
        console.error('Error adding tag:', error);
        Swal.fire('Error', 'Error al añadir la etiqueta.', 'error');
      }
    }
  };

  const handleValidatePost = async (postId) => {
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
        await axios.put(`${backendUrl}/api/posts/${postId}/validate`, {}, {
          withCredentials: true
        });
        setPosts(posts.filter(post => post.id !== postId));
        Swal.fire('Validado', 'La publicación ha sido validada.', 'success');
      } catch (err) {
        console.error("Error validating the post", err);
        Swal.fire('Error', 'Error al validar la publicación.', 'error');
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (!currentUser) {
      setError('User information not available');
      return;
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la publicación permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${backendUrl}/api/posts/${postId}`, {
          withCredentials: true,
          data: { isAdmin: currentUser.isAdmin }
        });
        setPosts(posts.filter(post => post.id !== postId));
        Swal.fire('Eliminado', 'La publicación ha sido eliminada.', 'success');
      } catch (err) {
        console.error("Error deleting the post", err);
        setError('Error deleting the post: ' + (err.response?.data?.error || err.message));
        Swal.fire('Error', 'Error al eliminar la publicación.', 'error');
      }
    }
  };

  const handleSortChange = () => {
    setSortOrder(prevOrder => (prevOrder === 'ASC' ? 'DESC' : 'ASC'));
  };

  const handleOrderByChange = () => {
    setOrderBy(prevOrder => {
      if (prevOrder === 'created_at') return 'title';
      if (prevOrder === 'title') return 'user_name';
      return 'created_at';
    });
  };

  const handleAcceptTag = async (tagId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción aceptará la etiqueta recomendada.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, aceptar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.post(`${backendUrl}/api/recommended-tags/${tagId}/accept`, {}, { withCredentials: true });
        setRecommendedTags(recommendedTags.filter(tag => tag.id !== tagId));
        Swal.fire('Aceptado', 'La etiqueta recomendada ha sido aceptada y añadida.', 'success');
      } catch (error) {
        console.error('Error accepting recommended tag:', error);
        Swal.fire('Error', 'Error al aceptar la etiqueta recomendada.', 'error');
      }
    }
  };

  const handleDenyTag = async (tagId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción denegará la etiqueta recomendada.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, denegar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${backendUrl}/api/recommended-tags/${tagId}/deny`, { withCredentials: true });
        setRecommendedTags(recommendedTags.filter(tag => tag.id !== tagId));
        Swal.fire('Denegado', 'La etiqueta recomendada ha sido denegada y eliminada.', 'success');
      } catch (error) {
        console.error('Error denying recommended tag:', error);
        Swal.fire('Error', 'Error al denegar la etiqueta recomendada.', 'error');
      }
    }
  };

  const handleDeleteTag = async (tagId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la etiqueta.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${backendUrl}/api/tags/${tagId}`, { withCredentials: true });
        setTags(tags.filter(tag => tag.id !== tagId));
        Swal.fire('Eliminado', 'La etiqueta ha sido eliminada.', 'success');
      } catch (error) {
        console.error('Error deleting tag:', error);
        Swal.fire('Error', 'Error al eliminar la etiqueta.', 'error');
      }
    }
  };

  const handleValidateReview = async (reviewId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción validará la reseña.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, validar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`${backendUrl}/api/reviews/${reviewId}/validate`, {}, {
          withCredentials: true
        });
        setReviews(reviews.filter(review => review.id !== reviewId));
        Swal.fire('Validado', 'La reseña ha sido validada.', 'success');
      } catch (err) {
        console.error("Error validating the review", err);
        Swal.fire('Error', 'Error al validar la reseña.', 'error');
      }
    }
  };

  const handleDenyReview = async (reviewId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la reseña.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${backendUrl}/api/reviews/${reviewId}/deny`, {
          withCredentials: true
        });
        setReviews(reviews.filter(review => review.id !== reviewId));
        Swal.fire('Eliminado', 'La reseña ha sido eliminada.', 'success');
      } catch (err) {
        console.error("Error denying the review", err);
        Swal.fire('Error', 'Error al eliminar la reseña.', 'error');
      }
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (orderBy === 'created_at') {
      return sortOrder === 'DESC' ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at);
    }
    if (orderBy === 'title') {
      return sortOrder === 'DESC' ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title);
    }
    if (orderBy === 'user_name') {
      return sortOrder === 'DESC' ? b.user_name.localeCompare(a.user_name) : a.user_name.localeCompare(b.user_name);
    }
    return 0;
  });

  const renderTags = (postTags) => {
    return postTags.map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return (
        <TagItem key={tagId}>
          <TagName>{tag ? tag.name : tagId}</TagName>
        </TagItem>
      );
    });
  };

  return (
    <RootContainer>
      <PageContainer>
        <Container>
          <Header>
            <Title>Contenido para Validar</Title>
            <SortButton onClick={handleOrderByChange}>
              {orderBy === 'created_at' ? 'Fecha' : orderBy === 'title' ? 'Título' : 'Autor'}
              {sortOrder === 'DESC' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </SortButton>
          </Header>

          <FormContainer>
            <Form onSubmit={handleAddTag}>
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Nueva Etiqueta"
              />
              <Button type="submit">Agregar Etiqueta</Button>
            </Form>
          </FormContainer>

          {loading && <Card>Cargando...</Card>}
          {error && <Error>{error}</Error>}

          {!loading && !error && (
            <>
              <SectionTitle>Publicaciones para Validar</SectionTitle>
              {sortedPosts.length === 0 ? (
                <Card>No hay publicaciones para validar.</Card>
              ) : (
                sortedPosts.map(post => (
                  <Card key={post.id}>
                    <CardTitle>
                      <StyledLink to={`/post/${post.id}`}>
                        {post.title}
                      </StyledLink>
                    </CardTitle>
                    <Meta>
                      Por {post.user_name} • {new Date(post.created_at).toLocaleDateString()}
                    </Meta>
                    <p>{post.body.substring(0, 150)}...</p>
                    <TagList>{renderTags(post.tags)}</TagList>
                    {post.validated === 0 && (
                      <ValidationMessage>
                        <AlertCircle size={16} />
                        Validación pendiente
                      </ValidationMessage>
                    )}
                    <ButtonContainer>
                      <ValidateButton
                        onClick={() => handleValidatePost(post.id)}
                        aria-label={`Validate post: ${post.title}`}
                      >
                        Validar
                      </ValidateButton>
                      <DeleteButton
                        onClick={() => handleDeletePost(post.id)}
                        aria-label={`Delete post: ${post.title}`}
                      >
                        Eliminar
                      </DeleteButton>
                    </ButtonContainer>
                  </Card>
                ))
              )}

              <SectionTitle>Reseñas para Validar</SectionTitle>
              {reviews.length === 0 ? (
                <Card>No hay reseñas para validar.</Card>
              ) : (
                reviews.map(review => (
                  <ReviewCard key={review.id}>
                    <ReviewContent>{review.comment}</ReviewContent>
                    <ReviewRating>
                      <Star size={16} fill="#f39c12" />
                      {review.rating}/5
                    </ReviewRating>
                    <Meta>
                      Por {review.user_name} • {new Date(review.created_at).toLocaleDateString()}
                    </Meta>
                    <ButtonContainer>
                      <ValidateButton
                        onClick={() => handleValidateReview(review.id)}
                        aria-label={`Validate review: ${review.id}`}
                      >
                        Validar
                      </ValidateButton>
                      <DeleteButton
                        onClick={() => handleDenyReview(review.id)}
                        aria-label={`Deny review: ${review.id}`}
                      >
                        Denegar
                      </DeleteButton>
                    </ButtonContainer>
                  </ReviewCard>
                ))
              )}

              <SectionTitle>Etiquetas Recomendadas</SectionTitle>
              {recommendedTags.length === 0 ? (
                <Card>No hay tags recomendadas.</Card>
              ) : (
                <TagList>
                  {recommendedTags.map(tag => (
                    <TagItem key={tag.id}>
                      <TagName>{tag.tag}</TagName>
                      <ButtonContainer>
                        <DeleteTagButton
                          onClick={() => handleAcceptTag(tag.id)}
                          aria-label={`Accept tag: ${tag.tag}`}
                        >
                          <StyledCheck size={20} />
                        </DeleteTagButton>
                        <DeleteTagButton
                          onClick={() => handleDenyTag(tag.id)}
                          aria-label={`Deny tag: ${tag.tag}`}
                        >
                          <X size={20} />
                        </DeleteTagButton>
                      </ButtonContainer>
                    </TagItem>
                  ))}
                </TagList>
              )}

              <SectionTitle>Etiquetas Actuales</SectionTitle>
              <TagList>
                {tags.map(tag => (
                  <TagItem key={tag.id}>
                    <TagName>{tag.name}</TagName>
                    <DeleteTagButton 
                      onClick={() => handleDeleteTag(tag.id)}
                      aria-label={`Delete tag: ${tag.name}`}
                    >
                      <X size={20} />
                    </DeleteTagButton>
                  </TagItem>
                ))}
              </TagList>
            </>
          )}
        </Container>
      </PageContainer>
    </RootContainer>
  );
}


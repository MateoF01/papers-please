import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import backgroundImage from './background.png';

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

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding-top: 80px;
  position: relative;
  z-index: 1;
`;

const Container = styled.div`
  width: 100%;
  max-width: 800px;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
`;

const SortButton = styled.button`
  background: white;
  border: none;
  color: #666;
  font-size: 1rem;
  cursor: pointer;
  padding: 10px;
  border-radius: 5px;
  margin-left: 10px;
`;

const FormContainer = styled.div`
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const Card = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
`;

const Title = styled.h2`
  margin: 0 0 10px 0;
  color: #333;
`;

const Meta = styled.div`
  color: #666;
  font-size: 0.9em;
  margin-bottom: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-top: 10px;
`;

const ValidateButton = styled(Button)`
  background-color: #28a745;
  color: white;
`;

const DeleteButton = styled(Button)`
  background-color: #dc3545;
  color: white;
`;

const Error = styled.div`
  color: #dc3545;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  backdrop-filter: blur(5px);
`;

const ValidationMessage = styled.div`
  color: #dc3545;
  font-weight: bold;
  margin-top: 10px;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;

  &:hover {
    text-decoration: underline;
  }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
`;

const TagItem = styled.div`
  background-color: #f0f0f0;
  color: #333;
  border-radius: 20px;
  padding: 5px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;

  &:hover {
    background-color: #e0e0e0;
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

const TagName = styled.span`
  margin-right: 10px;
`;

const DeleteTagButton = styled.button`
  background-color: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1rem;
  padding: 2px 5px;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    color: #dc3545;
    background-color: rgba(220, 53, 69, 0.1);
  }
`;

const RecommendedTagList = styled(TagList)``;

const RecommendedTagItem = styled(TagItem)``;

const RecommendedTagName = styled(TagName)``;

const RecommendedTagButton = styled(DeleteTagButton)`
  &:hover {
    color: #28a745;
    background-color: rgba(40, 167, 69, 0.1);
  }
`;

export default function PostListToValidate() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentUser, setCurrentUser] = useState(null);
  const [orderBy, setOrderBy] = useState('created_at');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);
  const [recommendedTags, setRecommendedTags] = useState([]);

  useEffect(() => {
    const fetchPostsAndUser = async () => {
      try {
        const [postsResponse, userResponse, tagsResponse, recommendedTagsResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/posts/to-validate`, {params: {orderBy, order: sortOrder}, withCredentials: true }),
          axios.get(`${backendUrl}/api/user`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/tags`),
          axios.get(`${backendUrl}/api/recommended-tags`, { withCredentials: true })
        ]);
        setPosts(postsResponse.data);
        setCurrentUser(userResponse.data);
        setTags(tagsResponse.data);
        setRecommendedTags(recommendedTagsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading data');
        setLoading(false);
      }
    };

    fetchPostsAndUser();
  }, [orderBy, sortOrder]);

  const handleAddTag = async (e) => {
    e.preventDefault();

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
    try {
      await axios.delete(`${backendUrl}/api/posts/${postId}`, {
        withCredentials: true,
        data: { isAdmin: currentUser.isAdmin }
      });
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      console.error("Error deleting the post", err);
      setError('Error deleting the post: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSortChange = () => {
    setSortOrder(prevOrder => (prevOrder === 'ASC' ? 'DESC' : 'ASC'));
  };

  const handleOrderByChange2 = () => {
    setOrderBy(prevOrder => {
      if (prevOrder === 'created_at'){
        return 'title'
      } else if (prevOrder === "title"){
        return 'user_name'
      } else{
        return 'created_at'
      }})
  }

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

  const sortedPosts = [...posts];

  const renderTags = (postTags) => {
    return postTags.map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return <span key={tagId} className="tag">{tag ? tag.name : tagId}</span>;
    });
  };

  return (
    <>
      <RootContainer />
      <PageContainer>
        <Container>
          <Header>
            <SortButton onClick={() => handleOrderByChange2()}>
              {orderBy === 'created_at' ? 'Fecha' : orderBy === 'title' ? 'Titulo' : 'Autor'}
            </SortButton>
            <SortButton onClick={handleSortChange}>
              {sortOrder === 'DESC' ? '▼' : '▲'}
            </SortButton>
          </Header>
          <FormContainer>
            <form onSubmit={handleAddTag}>
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Nuevo Tag"
              />
              <Button type="submit">Agregar</Button>
            </form>
          </FormContainer>
          {loading && <Card>Loading...</Card>}
          {error && <Error>{error}</Error>}
          {!loading && !error && sortedPosts.length === 0 && (
            <Card>No hay publicaciones para validar.</Card>
          )}
          {!loading && !error && sortedPosts.map(post => (
            <Card key={post.id}>
              <Title>
                <StyledLink to={`/post/${post.id}`}>
                  {post.title}
                </StyledLink>
              </Title>
              <Meta>
                By {post.user_name} • {new Date(post.created_at).toLocaleDateString()}
              </Meta>
              <p>{post.body.substring(0, 150)}...</p>
              <div>Tags: {renderTags(post.tags)}</div>
              {post.validated === 0 && (
                <ValidationMessage>Validación pendiente</ValidationMessage>
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
          ))}
          <Card>
            <h2>Etiquetas Recomendadas</h2>
            <RecommendedTagList>
              {recommendedTags.map(tag => (
                <RecommendedTagItem key={tag.id}>
                  <RecommendedTagName>{tag.tag}</RecommendedTagName>
                  <div>
                    <RecommendedTagButton
                      onClick={() => handleAcceptTag(tag.id)}
                      aria-label={`Accept tag: ${tag.tag}`}
                    >
                      ✓
                    </RecommendedTagButton>
                    <RecommendedTagButton
                      onClick={() => handleDenyTag(tag.id)}
                      aria-label={`Deny tag: ${tag.tag}`}
                    >
                      ×
                    </RecommendedTagButton>
                  </div>
                </RecommendedTagItem>
              ))}
            </RecommendedTagList>
          </Card>
          <Card>
            <h2>Etiquetas Actuales</h2>
            <TagList>
              {tags.map(tag => (
                <TagItem key={tag.id}>
                  <TagName>{tag.name}</TagName>
                  <DeleteTagButton 
                    onClick={() => handleDeleteTag(tag.id)}
                    aria-label={`Delete tag: ${tag.name}`}
                  >
                    ×
                  </DeleteTagButton>
                </TagItem>
              ))}
            </TagList>
          </Card>
        </Container>
      </PageContainer>
    </>
  );
}


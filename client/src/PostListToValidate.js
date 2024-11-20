import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import backgroundImage from './background.png';
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

export default function PostListToValidate() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentUser, setCurrentUser] = useState(null);
  const [orderBy, setOrderBy] = useState('created_at');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchPostsAndUser = async () => {
      try {
        const [postsResponse, userResponse, tagsResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/posts/to-validate`, {params: {orderBy, order: sortOrder}, withCredentials: true }),
          axios.get(`${backendUrl}/api/user`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/tags`)
        ]);
        setPosts(postsResponse.data);
        setCurrentUser(userResponse.data);
        setTags(tagsResponse.data);
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
    try {
      const response = await axios.post(`${backendUrl}/api/tags`, { tagName: newTag });
      setTags([...tags, response.data.tag]);
      setNewTag('');
    } catch (error) {
      console.error('Error adding tag:', error);
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
        await axios.delete(`${backendUrl}/api/posts/${postId}`, {
          withCredentials: true,
          data: { isAdmin: currentUser.isAdmin }
        });
        setPosts(posts.filter(post => post.id !== postId));
        Swal.fire('Eliminado', 'La publicación ha sido eliminada.', 'success');
      } catch (err) {
        console.error("Error deleting the post", err);
        Swal.fire('Error', 'Error al eliminar la publicación.', 'error');
      }
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
                placeholder="Nuevo tag"
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
        </Container>
      </PageContainer>
    </>
  );
}
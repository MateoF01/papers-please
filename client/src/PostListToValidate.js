import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import backgroundImage from './background.png';

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

const Button = styled.button`
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:focus {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
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
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchPostsAndUser = async () => {
      try {
        const [postsResponse, userResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/posts/to-validate', { withCredentials: true }),
          axios.get('http://localhost:8080/api/user', { withCredentials: true })
        ]);
        setPosts(postsResponse.data);
        setCurrentUser(userResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading data');
        setLoading(false);
      }
    };

    fetchPostsAndUser();
  }, []);

  const handleValidatePost = async (postId) => {
    try {
      await axios.put(`http://localhost:8080/api/posts/${postId}/validate`, {}, {
        withCredentials: true
      });
      // Remove the validated post from the list
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      console.error("Error validating the post", err);
      setError('Error validating the post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!currentUser) {
      setError('User information not available');
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/posts/${postId}`, {
        withCredentials: true,
        data: { isAdmin: currentUser.isAdmin }
      });
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      console.error("Error deleting the post", err);
      setError('Error deleting the post: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <>
      <RootContainer />
      <PageContainer>
        <Container>
          {loading && <Card>Loading...</Card>}
          {error && <Error>{error}</Error>}
          {!loading && !error && posts.length === 0 && (
            <Card>No hay publicaciones para validar.</Card>
          )}
          {!loading && !error && posts.map(post => (
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
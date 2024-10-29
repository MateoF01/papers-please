import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const PostContainer = styled.div`
  padding: 80px 20px 20px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const PostCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const PostTitle = styled.h2`
  margin: 0 0 10px 0;
  color: #333;
`;

const PostMeta = styled.div`
  color: #666;
  font-size: 0.9em;
  margin-bottom: 10px;
`;

const PostLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const ValidationMessage = styled.div`
  color: red;
  font-weight: bold;
  margin-top: 10px;
`;

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/posts/user/me', { 
          withCredentials: true 
        });
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar tus publicaciones');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <PostContainer>
      {posts.map(post => (
        <PostLink to={`/post/${post.id}`} key={post.id}>
          <PostCard>
            <PostTitle>{post.title}</PostTitle>
            <PostMeta>
              Creado el {new Date(post.created_at).toLocaleDateString()}
            </PostMeta>
            <p>{post.body.substring(0, 150)}...</p>
            {post.validated === 0 && (
              <ValidationMessage>Pendiente de validación</ValidationMessage>
            )}
          </PostCard>
        </PostLink>
      ))}
    </PostContainer>
  );
}

export default MyPosts;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

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

const ValidationMessage = styled.div`
  color: red;
  font-weight: bold;
  margin-top: 10px;
`;

const ValidateButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #218838;
  }
`;

function PostListToValidate() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/posts/to-validate', {
          withCredentials: true
        });
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las publicaciones para validar');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleValidatePost = async (postId) => {
    try {
      await axios.put(`http://localhost:8080/api/posts/${postId}/validate`, {}, {
        withCredentials: true
      });
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, validated: 1 } : post
      ));
    } catch (err) {
      console.error("Error al validar la publicación", err);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <PostContainer>
      {posts.map(post => (
        <PostCard key={post.id}>
          <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <PostTitle>{post.title}</PostTitle>
          </Link>
          <PostMeta>
            Por {post.user_name} • {new Date(post.created_at).toLocaleDateString()}
          </PostMeta>
          <p>{post.body.substring(0, 150)}...</p>
          {post.validated === 0 && (
            <>
              <ValidationMessage>Pendiente de validación</ValidationMessage>
              <ValidateButton onClick={() => handleValidatePost(post.id)}>
                Validar
              </ValidateButton>
            </>
          )}
        </PostCard>
      ))}
    </PostContainer>
  );
}

export default PostListToValidate;

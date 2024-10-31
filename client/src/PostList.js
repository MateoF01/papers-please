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

const PostContainer = styled.div`
  padding: 80px 20px 20px 20px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
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
  font-size: 1.25rem;
  cursor: pointer;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s ease;
  font-weight: 600;
  line-height: 26px;
  padding-left: 20px;
  padding-right: 20px;
  min-width: 124px;
  height: 55px;
  border-radius: 10px;  
  
  &:hover {
    color: #333;
  }

  &:focus {
    outline: none;
  }
`;

const PostCard = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  transition: transform 0.2s;
  display: flex;
  gap: 20px;

  &:hover {
    transform: translateY(-2px);
  }
`;

const PostContent = styled.div`
  flex: 1;
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

const PostImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
`;

const PostImagePlaceholder = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 8px;
  background-color: #f0f0f0;
  flex-shrink: 0;
`;

const AdminName = styled.span`
  color: #28a745;
  font-weight: bold;
`;

function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/posts', { 
          withCredentials: true 
        });
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las publicaciones');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleSortChange = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const sortedPosts = [...posts]
    .filter(post => post.validated === 1)
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const renderAuthorName = (post) => {
    if (post.user_isAdmin === 1) {
      //tag de admin
      return <AdminName>{post.user_name} (admin)</AdminName>;
    }
    return post.user_name;
  };

  return (
    <>
      <RootContainer />
      <PostContainer>
        <Header>
          <SortButton onClick={handleSortChange}>
            Ordenar por fecha {sortOrder === 'desc' ? '▼' : '▲'}
          </SortButton>
        </Header>
        
        {loading && <div>Cargando...</div>}
        {error && <div>{error}</div>}
        {!loading && !error && sortedPosts.map(post => (
          <PostLink to={`/post/${post.id}`} key={post.id}>
            <PostCard>
              <PostContent>
                <PostTitle>{post.title}</PostTitle>
                <PostMeta>
                  Por {renderAuthorName(post)} • {new Date(post.created_at).toLocaleDateString()}
                </PostMeta>
                <p>{post.body.substring(0, 150)}...</p>
              </PostContent>
              {post.image ? (
                <PostImage 
                  src={`http://localhost:8080${post.image}`} 
                  alt={`Imagen de ${post.title}`}
                />
              ) : (
                <PostImagePlaceholder />
              )}
            </PostCard>
          </PostLink>
        ))}
        {!loading && !error && sortedPosts.length === 0 && (
          <PostCard>
            <p>No hay publicaciones disponibles en este momento.</p>
          </PostCard>
        )}
      </PostContainer>
    </>
  );
}

export default PostList;
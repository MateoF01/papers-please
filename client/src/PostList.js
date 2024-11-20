import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
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

const PostContainer = styled.div`
  padding: 80px 20px 20px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 200px auto auto auto auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchInput = styled.div`
  position: relative;
  width: 200px;

  input {
    width: 100%;
    padding: 8px 32px 8px 12px;
    border: 1px solid #ccc;
    border-radius: 10px;
    font-size: 0.9rem;
    height: 38px;
    box-sizing: border-box;
  }

  svg {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
`;

const SortButton = styled.button`
  background: white;
  border: none;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: color 0.3s ease;
  font-weight: 600;
  padding: 8px 16px;
  height: 38px;
  border-radius: 10px;
  white-space: nowrap;
  
  &:hover {
    color: #333;
  }

  &:focus {
    outline: none;
  }
`;

const TagSelect = styled.select`
  padding: 8px;
  border-radius: 10px;
  border: 1px solid #ccc;
  height: 38px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  min-width: 120px;
  box-sizing: border-box;
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
  margin: 0 0 10px;
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

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
`;

const Tag = styled.span`
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  color: #666;
`;

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('DESC');
  const [orderBy, setOrderBy] = useState('created_at');
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/posts`, {
          params: { orderBy, order: sortOrder },
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
  }, [orderBy, sortOrder]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/tags`);
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

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

  const handleTagChange = (e) => {
    const selectedTags = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTags(selectedTags);
  };

  const handleClearTags = () => {
    setSelectedTags([]);
  };

  const filteredPosts = posts
    .filter(post => post.validated === 1)
    .filter(post => {
      if (selectedTags.length === 0) return true;
      return selectedTags.every(tag => post.tags.includes(parseInt(tag)));
    })
    .filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderAuthorName = (post) => {
    return post.user_isAdmin === 1 ? <AdminName>{post.user_name} (admin)</AdminName> : post.user_name;
  };

  const renderTags = (postTags) => {
    return (
      <TagsContainer>
        {postTags.map(tagId => {
          const tag = tags.find(t => t.id === tagId);
          return <Tag key={tagId}>{tag ? tag.name : tagId}</Tag>;
        })}
      </TagsContainer>
    );
  };

  return (
    <>
      <RootContainer />
      <PostContainer>
        <Header>
          <SearchInput>
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
            <Search size={16} />
          </SearchInput>
          <SortButton onClick={handleOrderByChange}>
            {orderBy === 'created_at' ? 'Fecha' : orderBy === 'title' ? 'Titulo' : 'Autor'}
          </SortButton>
          <SortButton onClick={handleSortChange}>
            {sortOrder === 'DESC' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </SortButton>
          <TagSelect multiple onChange={handleTagChange} value={selectedTags}>
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </TagSelect>
          <SortButton onClick={handleClearTags}>
            <X size={16} />
          </SortButton>
        </Header>
        
        {loading && <div>Cargando...</div>}
        {error && <div>{error}</div>}
        {!loading && !error && filteredPosts.map(post => (
          <PostLink to={`/post/${post.id}`} key={post.id}>
            <PostCard>
              <PostContent>
                <PostTitle>{post.title}</PostTitle>
                <PostMeta>
                  Por {renderAuthorName(post)} • {new Date(post.created_at).toLocaleDateString()}                
                </PostMeta>
                <p>{post.body.substring(0, 150)}...</p>
                {renderTags(post.tags)}
              </PostContent>
              {post.image ? (
                <PostImage 
                  src={`${backendUrl}${post.image}`} 
                  alt={`Imagen de ${post.title}`}
                />
              ) : (
                <PostImagePlaceholder />
              )}
            </PostCard>
          </PostLink>
        ))}
        {!loading && !error && filteredPosts.length === 0 && (
          <PostCard>
            <p>No hay publicaciones disponibles en este momento.</p>
          </PostCard>
        )}
      </PostContainer>
    </>
  );
}
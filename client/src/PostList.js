import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
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
  padding: 80px 20px 20px 20px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const SortButton = styled.button`
  background: white;
  border: none;
  color: #666;
  font-size: 1rem;
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
  height: 55px;
  border-radius: 10px;  
  margin-right: 10px;
  
  &:hover {
    color: #333;
  }

  &:focus {
    outline: none;
  }
`;

const SearchInput = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 200px;
  margin-right: 10px;
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

const SortButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('DESC');
  const [orderBy, setOrderBy] = useState('created_at');
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el texto de búsqueda

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

  const handleTagChange = (e) => {
    const selectedTags = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTags(selectedTags);
  };

  const handleClearTags = () => {
    setSelectedTags([]);
  };

  const filteredPosts = posts
    .filter(post => {
      if (selectedTags.length === 0) return true;
      return selectedTags.every(tag => post.tags.includes(parseInt(tag)));
    })
    .filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const sortedPosts = filteredPosts.filter(post => post.validated === 1);

  const renderAuthorName = (post) => {
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
        <Header>
          <SearchInput 
            type="text" 
            placeholder="Buscar por título..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
          {/* <SortButton onClick={() => handleOrderByChange2()}>
            {orderBy === 'created_at' ? 'Fecha' : orderBy === 'title' ? 'Titulo' : 'Autor'}
          </SortButton>
          <SortButton onClick={handleSortChange}>
            {sortOrder === 'DESC' ? '▼' : '▲'}
          </SortButton> */}
          <SortButtonsContainer>
            <SortButton onClick={handleOrderByChange2}>
              {orderBy === 'created_at' ? 'Fecha' : orderBy === 'title' ? 'Titulo' : 'Autor'}
            </SortButton>
            <SortButton onClick={handleSortChange}>
              {sortOrder === 'DESC' ? '▼' : '▲'}
            </SortButton>
          </SortButtonsContainer>
          <select multiple onChange={handleTagChange} style={{ marginLeft: '10px', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', height: '55px', fontSize: '1rem', fontWeight: '600', color: '#666', cursor: 'pointer' }}>
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
          <SortButton onClick={handleClearTags} >
           Eliminar Filtros
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
                <div>Tags: {renderTags(post.tags)}</div>
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

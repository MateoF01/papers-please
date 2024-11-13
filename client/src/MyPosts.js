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
  margin-bottom: 15px;
`;

const SearchInput = styled.input`
  padding: 10px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-right: 15px;
  width: 100%;
  max-width: 300px;
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

const PostCard = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
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
  color: #ff3333;
  font-weight: bold;
  margin-top: 10px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

const SortButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('created_at');
  const [searchTerm, setSearchTerm] = useState(''); // Agregar estado de búsqueda

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/posts/user/me`, {
          params: { orderBy, order: sortOrder },
          withCredentials: true,
        });
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar tus publicaciones');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [orderBy, sortOrder]);

  const handleSortChange = () => {
    setSortOrder((prevOrder) => (prevOrder === 'ASC' ? 'DESC' : 'ASC'));
  };

  const handleOrderByChange2 = () => {
    setOrderBy((prevOrder) => {
      if (prevOrder === 'created_at') {
        return 'title';
      } else if (prevOrder === 'title') {
        return 'user_name';
      } else {
        return 'created_at';
      }
    });
  };

  // Filtrar posts basado en el término de búsqueda
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <RootContainer />
      <PostContainer>
        <Header>
          <SearchInput
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Actualizar término de búsqueda
          />
          <SortButtonsContainer>
            <SortButton onClick={handleOrderByChange2}>
              {orderBy === 'created_at' ? 'Fecha' : orderBy === 'title' ? 'Titulo' : 'Autor'}
            </SortButton>
            <SortButton onClick={handleSortChange}>
              {sortOrder === 'DESC' ? '▼' : '▲'}
            </SortButton>
          </SortButtonsContainer>
        </Header>

        {loading && <div>Cargando...</div>}
        {error && <div>{error}</div>}
        {!loading && !error && filteredPosts.map((post) => (
          <PostLink to={`/post/${post.id}`} key={post.id}>
            <PostCard>
              <PostTitle>{post.title}</PostTitle>
              <PostMeta>Creado el {new Date(post.created_at).toLocaleDateString()}</PostMeta>
              <p>{post.body.substring(0, 150)}...</p>
              {post.validated === 0 && (
                <ValidationMessage>Pendiente de validación</ValidationMessage>
              )}
            </PostCard>
          </PostLink>
        ))}
      </PostContainer>
    </>
  );
}

export default MyPosts;

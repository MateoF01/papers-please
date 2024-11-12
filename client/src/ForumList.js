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

const ForumContainer = styled.div`
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
  // min-width: 124px;
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

const ForumCard = styled.div`
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

const ForumContent = styled.div`
  flex: 1;
`;

const ForumTitle = styled.h2`
  margin: 0 0 10px 0;
  color: #333;
`;

const ForumMeta = styled.div`
  color: #666;
  font-size: 0.9em;
  margin-bottom: 10px;
`;

const ForumLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const ForumImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
`;

const ForumImagePlaceholder = styled.div`
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

function ForumList() {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('DESC');
  const [orderBy, setOrderBy] = useState('created_at');

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/forums`, {
          params: {orderBy, order: sortOrder},
          withCredentials: true 
        });
        setForums(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los foros');
        setLoading(false);
      }
    };

    fetchForums();
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

  const sortedForums = [...forums].sort((a, b) => {
    let comparison = 0;

    // Si ordenamos por fecha
    if (orderBy === 'created_at') {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        comparison = dateA - dateB;
    }

    // Si ordenamos por título
    if (orderBy === 'title') {
        comparison = a.title.localeCompare(b.title);
    }

    // Si ordenamos por nombre de usuario
    if (orderBy === 'user_name') {
        comparison = a.user_name.localeCompare(b.user_name);
    }

    // Si el orden es descendente, invertir la comparación
    return sortOrder === 'DESC' ? -comparison : comparison;
});


  const renderAuthorName = (forum) => {
    if (forum.user_isAdmin === 1) {
      //tag de admin
      return <AdminName>{forum.user_name} (admin)</AdminName>;
    }
    return forum.user_name;
  };

  return (
    <>
      <RootContainer />
      <ForumContainer>
        <Header>
          <SortButton onClick={() => handleOrderByChange2()}>
            {orderBy === 'created_at' ? 'Fecha' : orderBy === 'title' ? 'Titulo' : 'Autor'}
          </SortButton>
          <SortButton onClick={handleSortChange}>
            {sortOrder === 'DESC' ? '▼' : '▲'}
          </SortButton>
        </Header>
        
        {loading && <div>Cargando...</div>}
        {error && <div>{error}</div>}
        {!loading && !error && sortedForums.map(forum => (
          <ForumLink to={`/forums/${forum.id}`} key={forum.id}>
            <ForumCard>
              <ForumContent>
                <ForumTitle>{forum.title}</ForumTitle>
                <ForumMeta>
                  Por {renderAuthorName(forum)} • {new Date(forum.created_at).toLocaleDateString()}
                </ForumMeta>
                <p>{forum.body.substring(0, 150)}...</p>
              </ForumContent>
              {forum.image ? (
                <ForumImage 
                  src={`${backendUrl}${forum.image}`} 
                  alt={`Imagen de ${forum.title}`}
                />
              ) : (
                <ForumImagePlaceholder />
              )}
            </ForumCard>
          </ForumLink>
        ))}
        {!loading && !error && sortedForums.length === 0 && (
          <ForumCard>
            <p>No hay foros disponibles en este momento.</p>
          </ForumCard>
        )}
      </ForumContainer>
    </>
  );
}

export default ForumList;
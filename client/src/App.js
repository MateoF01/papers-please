import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Home from './Home';
import Publication from './Publication';
import PostList from './PostList';
import SinglePost from './SinglePost';
import backgroundImage from './background.png';
import styled from 'styled-components';
import DefaultButton from './components/button/DefaultButton';
import MyPosts from './MyPosts';
import PostListToValidate from './PostListToValidate';

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: rgba(0, 0, 0, 0.7);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const NavbarBrand = styled(Link)`
  color: #f5f5f5;
  font-size: 1.5rem;
  text-decoration: none;
  font-weight: bold;
`;

const NavbarRight = styled.div`
  display: flex;
  align-items: center;
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownButton = styled.button`
  background-color: transparent;
  color: #f5f5f5;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;


const NavbarButton = styled.button`
  background-color: transparent;
  color: #f5f5f5;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;


const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: ${({$isOpen}) => ($isOpen ? 'block' : 'none')};
  min-width: 150px;
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 0.5rem 1rem;
  color: #333;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const LogoutButton = styled.button`
  background-color: transparent;
  color: #f5f5f5;
  border: 1px solid #f5f5f5;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #f5f5f5;
    color: #333;
  }
`;

const buttonContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '30px',
};




function NavbarContent() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleNavigateToPublication = () => {
    navigate('/publication');
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    axios.post('http://localhost:8080/api/logout', {}, { withCredentials: true })
      .then(() => {
        navigate('/');
      })
      .catch(() => {
        setError('Error al cerrar la sesión');
      });
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (location.pathname === '/home' || location.pathname === '/publication') {
    return (
      <>
        <NavbarBrand to="/home">Papers Please</NavbarBrand>
        <NavbarRight>
          <NavbarButton onClick={handleNavigateToPublication}>Crear Publicación</NavbarButton>
          <LogoutButton onClick={handleLogout}>Cerrar Sesión</LogoutButton>
        </NavbarRight>
      </>
    );
  }

  return (
    <>
      <NavbarBrand to="/">Papers Please</NavbarBrand>
      <NavbarRight>
        <DropdownContainer>
          <DropdownButton onClick={toggleDropdown}>
            Cuenta
          </DropdownButton>
          <DropdownMenu $isOpen={isDropdownOpen}>
            <DropdownItem to="/register" onClick={toggleDropdown}>Registro</DropdownItem>
            <DropdownItem to="/login" onClick={toggleDropdown}>Iniciar Sesión</DropdownItem>
          </DropdownMenu>
        </DropdownContainer>
      </NavbarRight>
    </>
  );
}

function App() {
  return (
    <Router>
      <Navbar>
        <NavbarContent />
      </Navbar>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/publication" element={<Publication />} />
        <Route path="/posts" element={<PostList />} />
        <Route path="/my-posts" element={<MyPosts />} />
        <Route path="/posts-to-validate" element={<PostListToValidate />} />
        <Route path="/post/:id" element={<SinglePost />} />
        <Route path="/" element={<Root />} />
      </Routes>
    </Router>
  );
}

function Root() {
  const rootStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    color: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    textShadow: '2px 2px 20px black'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 2,
  };

  return (
    <div style={rootStyle}>
      <div style={overlayStyle}></div>
      <div style={contentStyle}>
        <h1 style={{ fontSize: '4rem' }}>Papers Please</h1>
        <h2>Bienvenido a nuestra aplicación.</h2>
        
        <div style={buttonContainerStyle}>
          <DefaultButton
            type="button"
            destination="/login"
            content='Iniciar Sesión'
            secondary
          />
          <DefaultButton
            type="button"
            content='Ir al Registro'
            destination="/register"
          />
        </div>    
      </div>
    </div>
  );
}

export default App;
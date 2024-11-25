import React, { useState, useEffect, useContext, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FaRobot } from 'react-icons/fa';
import { AlertCircle, Bell, Tag } from 'lucide-react';

import Register from './Register';
import Login from './Login';
import Home from './Home';
import Publication from './Publication';
import PostList from './PostList';
import NewForum from './NewForum';
import ForumList from './ForumList';
import SingleForum from './SingleForum';
import SinglePost from './SinglePost';
import MyPosts from './MyPosts';
import PostListToValidate from './PostListToValidate';
import AdminRoute from './components/routes/AdminRoute';
import AuthenticatedRoute from './components/routes/AuthenticatedRoute';
import Profile from './Profile';
import Bot from './Bot';
import ChatBot from './PopupBot';
import { AuthContext, AuthProvider } from './assets/AuthContext';
import DefaultButton from './components/button/DefaultButton';
import backgroundImage from './background.png';

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

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
  position: relative;
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

  ${({ hasUnvalidatedContent }) => hasUnvalidatedContent && `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 10px;
      height: 10px;
      background-color: red;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
  `}

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
    }
    
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
    }
    
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    }
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
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

const ChatBotButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #A1DA39;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
`;

const PopoverContent = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  z-index: 1000;
  width: 300px;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;

  &.active {
    opacity: 1;
    transform: translateY(0);
  }

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 20px;
    width: 12px;
    height: 12px;
    background-color: white;
    transform: rotate(45deg);
  }
`;


const PopoverList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const PopoverListItem = styled.li`
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  color: #333;
  font-size: 1rem;

  &:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
  }
`;

const PopoverIcon = styled.span`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #f0f0f0;
  border-radius: 50%;
`;

const buttonContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '30px',
};

function Popover({ children, content }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={popoverRef} style={{ position: 'relative' }}>
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {children}
      </div>
      <PopoverContent className={isOpen ? 'active' : ''} role="tooltip">
        {content}
      </PopoverContent>
    </div>
  );
}

function NavbarContent() {
  const { isAuthenticated, isAdmin, handleLogout, checkAuthentication } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasUnvalidatedContent, setHasUnvalidatedContent] = useState(false);
  const [unvalidatedPostsCount, setUnvalidatedPostsCount] = useState(0);
  const [unvalidatedTagsCount, setUnvalidatedTagsCount] = useState(0);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleNavigateToPublication = () => {
    navigate('/publication');
  };

  const handleLogoutClick = async () => {
    await handleLogout();
    navigate('/');
  };

  useEffect(() => {
    checkAuthentication();
  }, [isAuthenticated, isAdmin, checkAuthentication]);

  useEffect(() => {
    const checkUnvalidatedContent = async () => {
      if (isAdmin) {
        try {
          const postsResponse = await axios.get(`${backendUrl}/api/posts/to-validate`, { withCredentials: true });
          const unvalidatedPosts = postsResponse.data.filter(post => post.validated === 0);
          setUnvalidatedPostsCount(unvalidatedPosts.length);

          const tagsResponse = await axios.get(`${backendUrl}/api/recommended-tags`, { withCredentials: true });
          setUnvalidatedTagsCount(tagsResponse.data.length);

          setHasUnvalidatedContent(unvalidatedPosts.length > 0 || tagsResponse.data.length > 0);
        } catch (error) {
          console.error('Error fetching unvalidated content:', error);
        }
      }
    };

    checkUnvalidatedContent();
  }, [isAdmin]);

  return (
    <>
      <NavbarBrand to="/home">Papers Please</NavbarBrand>
      <NavbarRight>
        {isAuthenticated ? (
          <>
            <NavbarButton onClick={() => navigate('/profile')}>Mi Perfil</NavbarButton>
            <NavbarButton onClick={handleNavigateToPublication}>Crear Publicación</NavbarButton>
            <NavbarButton onClick={() => navigate('/posts')}>Ver Publicaciones</NavbarButton>
            <NavbarButton onClick={() => navigate('/my-posts')}>Ver Mis Publicaciones</NavbarButton>
            <NavbarButton onClick={() => navigate('/new-forum')}>Crear Foro</NavbarButton>
            <NavbarButton onClick={() => navigate('/bot')}>Asistente</NavbarButton>
            <NavbarButton onClick={() => navigate('/forums')}>Foros</NavbarButton>
            {isAdmin === 1 && (
              <Popover
                content={
                  <>
                    <PopoverList>
                      <PopoverListItem>
                        <PopoverIcon><AlertCircle size={16} /></PopoverIcon>
                        <span>Posts sin validar: {unvalidatedPostsCount}</span>
                      </PopoverListItem>
                      <PopoverListItem>
                        <PopoverIcon><Tag size={16} /></PopoverIcon>
                        <span>Tags sin validar: {unvalidatedTagsCount}</span>
                      </PopoverListItem>
                    </PopoverList>
                  </>
                }
              >
                <NavbarButton
                  hasUnvalidatedContent={hasUnvalidatedContent}
                  onClick={() => navigate('/posts-to-validate')}
                >
                  Validar Publicaciones
                </NavbarButton>
              </Popover>
            )}
            <LogoutButton onClick={handleLogoutClick}>Cerrar Sesión</LogoutButton>
          </>
        ) : (
          <DropdownContainer>
            <DropdownButton onClick={toggleDropdown}>Cuenta</DropdownButton>
            <DropdownMenu $isOpen={isDropdownOpen}>
              <DropdownItem to="/register" onClick={toggleDropdown}>Registro</DropdownItem>
              <DropdownItem to="/login" onClick={toggleDropdown}>Iniciar Sesión</DropdownItem>
            </DropdownMenu>
          </DropdownContainer>
        )}
      </NavbarRight>
    </>
  );
}

function App() {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  return (
    <AuthProvider>
      <Router>
        <Navbar>
          <NavbarContent />
        </Navbar>
        <Routes>
          {/* Rutas abiertas */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas por autenticación */}
          <Route path="/home" element={<AuthenticatedRoute element={Home} />} />
          <Route path="/publication" element={<AuthenticatedRoute element={Publication} />} />
          <Route path="/posts" element={<AuthenticatedRoute element={PostList} />} />
          <Route path="/forums" element={<AuthenticatedRoute element={ForumList} />} />
          <Route path="/new-forum" element={<AuthenticatedRoute element={NewForum} />} />
          <Route path="/my-posts" element={<AuthenticatedRoute element={MyPosts} />} />
          <Route path="/post/:id" element={<AuthenticatedRoute element={SinglePost} />} />
          <Route path="/forums/:id" element={<AuthenticatedRoute element={SingleForum} />} />
          <Route path="/profile" element={<AuthenticatedRoute element={Profile} />} />

          {/* Ruta protegida para admin */}
          <Route path="/posts-to-validate" element={<AdminRoute element={PostListToValidate} />} />
          <Route path="/bot" element={<AuthenticatedRoute element={Bot} />} />
          <Route path="/" element={<Root />} />
        </Routes>
        <ChatBotButton onClick={() => setIsChatBotOpen(!isChatBotOpen)}>
          
<FaRobot />
        </ChatBotButton>
        <ChatBot isOpen={isChatBotOpen} onClose={setIsChatBotOpen} />
      </Router>
    </AuthProvider>
  );
}

const RootContainer = styled.div`
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  height: 100vh;
  color: #f5f5f5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  text-shadow: 2px 2px 20px black;
  position: relative;
  z-index: 1;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: -1;
`;

function Root() {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  if (loading) return <div>Cargando...</div>;

  return (
    <RootContainer>
      <Overlay />
      <div>
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
    </RootContainer>
  );
}

export default App;


import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Home from './Home';
import Publication from './Publication';
import PostList from './PostList';
import NewForum from './NewForum';
import ForumList from './ForumList';
import SingleForum from './SingleForum';
import SinglePost from './SinglePost';
import backgroundImage from './background.png';
import styled from 'styled-components';
import DefaultButton from './components/button/DefaultButton';
import MyPosts from './MyPosts';
import PostListToValidate from './PostListToValidate';
import AdminRoute from './components/routes/AdminRoute';
import AuthenticatedRoute from './components/routes/AuthenticatedRoute';
import Profile from './Profile';
import { AuthContext, AuthProvider } from './assets/AuthContext';

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
  const { isAuthenticated, isAdmin, handleLogout, checkAuthentication } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

            <NavbarButton onClick={() => navigate('/forums')}>Foros</NavbarButton>
            {isAdmin === 1 && (
              <NavbarButton onClick={() => navigate('/posts-to-validate')}>Validar Publicaciones</NavbarButton>
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
  return (
    <AuthProvider>
      <Router basename='/papers-please'>
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
          
          <Route path="/" element={<Root />} />
        </Routes>
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
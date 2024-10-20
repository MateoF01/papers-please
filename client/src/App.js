import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Home from './Home';
import backgroundImage from './background.png';
import styled from 'styled-components';

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

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: ${props => props.isOpen ? 'block' : 'none'};
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

const LogoutButton = styled(Link)`
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

function NavbarContent() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  if (location.pathname === '/home') {
    return (
      <>
        <NavbarBrand to="/">Papers Please</NavbarBrand>
        <LogoutButton to="/">Cerrar Sesión</LogoutButton>
      </>
    );
  }

  return (
    <>
      <NavbarBrand to="/">Papers Please</NavbarBrand>
      <DropdownContainer>
        <DropdownButton onClick={toggleDropdown}>
          Cuenta
        </DropdownButton>
        <DropdownMenu isOpen={isDropdownOpen}>
          <DropdownItem to="/register" onClick={toggleDropdown}>Registro</DropdownItem>
          <DropdownItem to="/login" onClick={toggleDropdown}>Iniciar Sesión</DropdownItem>
        </DropdownMenu>
      </DropdownContainer>
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
    textShadow: '2px 2px 2px black',
    paddingTop: '60px',
  };

  return (
    <div style={rootStyle}>
      <h1>Papers Please</h1>
      <h3>Bienvenido a nuestra aplicación.</h3>
    </div>
  );
}

export default App;
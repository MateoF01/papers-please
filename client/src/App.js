import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Home from './Home';
import backgroundImage from './background.png';
import styled from 'styled-components';

const Button = styled.button`
  display: inline-block;
  padding: 15px 25px;
  font-size: 24px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  outline: none;
  color: #fff;
  background-color: #5ad390;
  border: none;
  border-radius: 15px;
  box-shadow: 0 9px #999;

  &:hover {
    background-color: #50b97f
  }

  &:active {
    background-color: #50b97f;
    box-shadow: 0 5px #666;
    transform: translateY(4px);
  }
  `;

function App() {
  return (
    <Router>
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
    textShadow: '2px 2px 2px black'
  };

  return (
    <div style={rootStyle}>
      <h1>Root</h1>
      <h3>Bienvenido a nuestra aplicación.</h3>
      <div style={{padding: '2%'}}>
        <Link to="/register">
          <Button>Ir a Registro</Button>
        </Link>
      </div>
      <div>
        <Link to="/login">
          <Button>Iniciar Sesión</Button>
        </Link>
      </div>
    </div>
  );
}

export default App;
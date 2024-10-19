import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Home from './Home';
import backgroundImage from './background.png';

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
      <Link to="/register">
        <button>Ir a Registro</button>
      </Link>
      <Link to="/login">
        <button>Iniciar Sesión</button>
      </Link>
    </div>
  );
}

export default App;
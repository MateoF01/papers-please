import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './Registro';
import Home from './Home';
import backgroundImage from './background.png'; // Import your image


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/registro" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Root />} />

      </Routes>
    </Router>
  );
}

// Componente para la página de inicio (Home)
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
      <Link to="/registro">
        <button>Ir a Registro</button>
      </Link>
    </div>
  );
}

export default App;

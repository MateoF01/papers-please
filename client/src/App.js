import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './Registro';
import Home from './Home';

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
  return (
    <div>
      <h1>Root</h1>
      <p>Bienvenido a nuestra aplicación.</p>
      <Link to="/registro">
        <button>Ir a Registro</button>
      </Link>
    </div>
  );
}

export default App;

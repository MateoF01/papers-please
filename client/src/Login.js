import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './background.png';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true)
    axios.post('http://localhost:8080/api/login', { email, password }, { withCredentials: true })
      .then(response => {
        setLoading(false)
        navigate('/home');
      })
      .catch(error => {
        setLoading(false)
        if (error.response && error.response.status === 401) {
          setError('Email o contraseña incorrectos');
        } else {
          setError('Error al iniciar sesión');
        }
      });
  };

  const loginStyle = {
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
    <div style={loginStyle}>
      <h1>Iniciar Sesión</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading } style={{ marginTop: '10px' }}>
          {loading ? <TailSpin stroke="#000000" /> : 'Iniciar Sesión'}
        </button>
      </form>
      {loading} {}
    </div>
  );
  }
  
  export default Login;
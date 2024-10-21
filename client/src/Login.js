import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './background.png';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';
import styled from 'styled-components';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Íconos de "ojo" para mostrar/ocultar contraseña

const Input = styled.input`
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: 3px solid #ccc;
  transition: border 0.5s;
  outline: none;

  &:focus {
    border: 3px solid #555;
  }
`;

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
    background-color: #50b97f;
  }

  &:active {
    background-color: #50b97f;
    box-shadow: 0 5px #666;
    transform: translateY(4px);
  }
`;

const generalErrorStyle = {
  color: '#ff6363',
  backgroundColor: '#ffe6e6',
  padding: '5px 10px',
  borderRadius: '5px',
  margin: '10px 0',
  width: '8%',
  boxShadow: '1px 1px 5px 2px rgba(0, 0, 0, 0.1)',
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
  textShadow: '1px 1px 2px black',
};

const inputContainerStyle = {
  position: 'relative',
  marginBottom: '20px',
  width: '100%',
  maxWidth: '300px',
};

const passwordInputContainerStyle = {
  ...inputContainerStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const eyeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  position: 'absolute',
  right: '10px',
};

function Login() {
  const [correoUsuario, setCorreoUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // Estado para alternar visibilidad de la contraseña
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible); // Alternamos la visibilidad de la contraseña
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true)
    axios.post('http://localhost:8080/api/login', { usuario: correoUsuario, password }, { withCredentials: true })
      .then(response => {
        setLoading(false)
        navigate('/home');
      })
      .catch(error => {
        setLoading(false)
        if (error.response && (error.response.status === 401 || error.response.status === 404 || error.response.status === 500)) {
          setError(error.response.data.error);
        } else {
          setError('Error al iniciar sesión');
        }
      });
  };

  return (
    <div style={loginStyle}>
      <h1>Iniciar Sesión</h1>
      {error && <h4 style={generalErrorStyle}>{error}</h4>}
      <form onSubmit={handleSubmit}>
        <div style={inputContainerStyle}>
          <Input
            type="correoUsuario"
            placeholder="Correo electrónico o Usuario"
            value={correoUsuario}
            onChange={e => setCorreoUsuario(e.target.value)}
            required
          />
        </div>
        <div style={passwordInputContainerStyle}>
          <Input
            type={passwordVisible ? 'text' : 'password'} // Cambia el tipo de input según el estado
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            style={eyeButtonStyle}
          >
            {passwordVisible ? <FaEyeSlash /> : <FaEye />} {/* Íconos de ojo */}
          </button>
        </div>
        <Button type="submit" disabled={loading } style={{ marginTop: '10px' }}>
          {loading ? <TailSpin stroke="#000000" /> : 'Iniciar Sesión'}
        </Button>
      </form>
      {loading} {}
    </div>
  );
  }
  
  export default Login;
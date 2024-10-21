import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './background.png';
import styled from 'styled-components';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importamos los íconos de "ojo"
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';

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

const registerStyle = {
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

const errorStyle = {
  color: '#ff6363',
  backgroundColor: '#ffe6e6',
  padding: '5px 10px',
  borderRadius: '5px',
  position: 'absolute',
  left: '110%',
  right: '-130%',
  top: '10%',
  margin: 'auto',
  boxShadow: '1px 1px 5px 2px rgba(0, 0, 0, 0.1)',
};

const generalErrorStyle = {
  color: '#ff6363',
  backgroundColor: '#ffe6e6',
  padding: '5px 10px',
  borderRadius: '5px',
  margin: '10px 0',
  width: '18%',
  boxShadow: '1px 1px 5px 2px rgba(0, 0, 0, 0.1)',
};

function Register() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // Estado para visibilidad
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleUserNameChange = useCallback((e) => {
    setUserName(e.target.value);
  }, []);

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible); // Alternamos visibilidad
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[a-zA-ZÀ-ÿ])(?=.*[A-ZÀ-ÿ])(?=.*\d)(?=.*[@$!%*?&])[A-Za-zÀ-ÿ\d@$!%*?&]{12,}$/;
    return re.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateEmail(email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!validatePassword(password)) {
      newErrors.password = 'La contraseña debe tener: ,al menos 12 caracteres, una mayúscula, una minúscula, un número, un símbolo';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    axios.post('http://localhost:8080/api/register', { userName, email, password }, { withCredentials: true })
    .then(response => {
        setLoading(false);
        navigate('/home');
      })
      .catch(error => {
        setLoading(false);
        if (error.response && error.response.data.error) {
          setErrors({ general: error.response.data.error });
        } else {
          setErrors({ general: 'Error al registrar el usuario' });
        }
      });
  };

  return (
    <div style={registerStyle}>
      <h1>Registro</h1>
      {errors.general && <h4 style={generalErrorStyle}>{errors.general}</h4>}
      <form onSubmit={handleSubmit}>
        <div style={inputContainerStyle}>
          <Input
            type="text"
            placeholder="Nombre de usuario"
            value={userName}
            onChange={handleUserNameChange}
            required
          />
          {errors.userName && <h4 style={errorStyle}>{errors.userName}</h4>}
        </div>
        <div style={inputContainerStyle}>
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={handleEmailChange}
            required
          />
          {errors.email && <h4 style={errorStyle}>{errors.email}</h4>}
        </div>
        <div style={passwordInputContainerStyle}>
          <Input
            type={passwordVisible ? 'text' : 'password'} // Cambia el tipo según el estado
            placeholder="Contraseña"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            style={eyeButtonStyle}
          >
            {passwordVisible ? <FaEyeSlash /> : <FaEye />} {/* Ícono de ojo */}
          </button>
          {errors.password && (() => {
            const passwordErrors = errors.password.split(',');
            return (
              <div style={errorStyle}>
                <h4 style={{ margin: 'auto' }}>{passwordErrors[0]}</h4>
                <ul style={{ margin: 'auto', fontWeight: 'bold', fontSize: 'smaller', textAlign: 'left' }}>
                  {passwordErrors.slice(1).map((error, index) => (
                    <li key={index}>{error.trim()}</li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </div>
        <Button type="sumbit" disabled={loading} style={{ marginTop: '10px' }}>
        {loading ? <TailSpin stroke="#000000" /> : 'Registrarse'}
        </Button>
      </form>
    </div>
  );
}

export default Register;

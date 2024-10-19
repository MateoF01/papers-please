import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './background.png';

function Register() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

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
      newErrors.password = 'La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un símbolo';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    axios.post('http://localhost:8080/api/register', { userName, email, password }, { withCredentials: true })
      .then(response => {
        navigate('/home');
      })
      .catch(error => {
        if (error.response && error.response.data.error) {
          setErrors({ general: error.response.data.error });
        } else {
          setErrors({ general: 'Error al registrar el usuario' });
        }
      });
  };

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
    textShadow: '2px 2px 2px black'
  };

  return (
    <div style={registerStyle}>
      <h1>Registro</h1>
      {errors.general && <p style={{color: 'red'}}>{errors.general}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {errors.email && <p style={{color: 'red'}}>{errors.email}</p>}
        </div>
        <div>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {errors.password && <p style={{color: 'red'}}>{errors.password}</p>}
        </div>
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}

export default Register;
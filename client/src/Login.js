import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './background.png';
import styled from 'styled-components';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Heading1 } from './components/text/Heading';
import DefaultButton from "./components/button/DefaultButton";
import TextInput from './components/form/input/text';
import { AuthContext } from './assets/AuthContext';

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

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
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  zIndex: 1,
};

const contentStyle = {
  position: 'relative',
  zIndex: 2,
};

const passwordInputContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  marginBottom: '20px',
  width: '100%',
  maxWidth: '300px',
};

const eyeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  position: 'absolute',
  right: '10px',
  bottom: '20%',
};

const StyledForm = styled(Form)`
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border: 2px solid #A1DA39;
  box-sizing: border-box;
  border-radius: 9px;
  padding: 50px 100px;
`;

const StyledErrorMessage = styled.div`
  font-family: "InterRegular";
  margin-top: -5px;
  max-width: 320px;
  word-wrap: break-word;
  white-space: normal;
  color: #DE4C38;
  font-size: 1rem;
`;

function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false); // Estado para alternar visibilidad de la contraseña
  const navigate = useNavigate();
  const { checkAuthentication } = useContext(AuthContext);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validationSchema = Yup.object({
    usuario: Yup.string().required('El correo electrónico o nombre de usuario es obligatorio'),
    password: Yup.string().required('La contraseña es obligatoria'),
  });

  const handleSubmit = (values, { setSubmitting, setErrors }) => {
    axios.post(`${backendUrl}/api/login`, values, { withCredentials: true })
      .then(response => {
        setSubmitting(false);
        checkAuthentication(); // Llama a checkAuthentication para actualizar el contexto de autenticación
        navigate('/home');
      })
      .catch(error => {
        setSubmitting(false);
        if (error.response && (error.response.status === 401 || error.response.status === 404 || error.response.status === 500)) {
          setErrors({ general: error.response.data.error });
        } else {
          setErrors({ general: 'Error al iniciar sesión' });
        }
      });
  };

  return (
    <div style={loginStyle}>
      <div style={overlayStyle}></div>
      <div style={contentStyle}>
        <Formik
          initialValues={{
            usuario: "",
            password: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <StyledForm>
              <div>
                <Heading1>Iniciar sesión</Heading1>
              </div>
              
              {errors.general && <StyledErrorMessage>{errors.general}</StyledErrorMessage>}
              
              <TextInput
                type="text"
                label="Correo electrónico o Usuario"
                name="usuario"
                placeholder="Correo electrónico o Usuario"
              />

              <div style={passwordInputContainerStyle}>
                <TextInput
                  type={passwordVisible ? 'text' : 'password'}
                  label="Contraseña"
                  name="password"
                  placeholder="Contraseña"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  style={eyeButtonStyle}
                >
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <DefaultButton
                type="submit"
                disabled={isSubmitting}
                content={isSubmitting ? <TailSpin stroke="#000000" /> : 'Iniciar Sesión'}
                secondary
              />
            </StyledForm>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Login;

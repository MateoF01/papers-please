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
import { Paragraph1 } from './components/text/Paragraph';
import DefaultButton from "./components/button/DefaultButton";
import TextInput from './components/form/input/text';
import { AuthContext } from './assets/AuthContext'; // Importo AuthContext

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

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
  top: '65%',
  transform: 'translateY(-50%)',
};

// TODO: Move to its own component
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

// TODO: Move to its own component
const StyledErrorMessage = styled.div`
  font-family: "InterRegular";
  margin-top: -5px;
  max-width: 320px;
  word-wrap: break-word;
  white-space: normal;
  color: #DE4C38;
  font-size: 1rem;
`;

function Register() {
  const [passwordVisible, setPasswordVisible] = useState(false); // Estado para visibilidad de la contraseña
  const navigate = useNavigate();
  const { checkAuthentication } = useContext(AuthContext); // Use AuthContext

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible); // Alternamos visibilidad
  };

  const validationSchema = Yup.object({
    userName: Yup.string()
      .required('El nombre de usuario es obligatorio'),
    email: Yup.string()
      .email('Formato de email inválido')
      .required('El correo electrónico es obligatorio'),
    password: Yup.string()
      .min(12, 'La contraseña debe tener al menos 12 caracteres')
      .matches(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
      .matches(/[a-z]/, 'Debe contener al menos una letra minúscula')
      .matches(/\d/, 'Debe contener al menos un número')
      .matches(/[^A-Za-z0-9\s]/, 'Debe contener al menos un símbolo especial (Ej.: @, $, !, %, *, ?, &)')
      .required('La contraseña es obligatoria'),
  });

  const handleSubmit = (values, { setSubmitting, setErrors }) => {
    axios.post(`${backendUrl}/api/register`, values, { withCredentials: true })
      .then(() => {
        setSubmitting(false);
        checkAuthentication(); // checkeo auth después de registrarme
        navigate('/home');
      })
      .catch(error => {
        setSubmitting(false);
        if (error.response && error.response.data.error) {
          setErrors({ general: error.response.data.error });
        } else {
          setErrors({ general: 'Error al registrar el usuario' });
        }
      });
  };

  return (
    <div style={registerStyle}>
      <div style={overlayStyle}></div>
      <div style={contentStyle}>
        <Formik
          initialValues={{
            userName: "",
            email: "",
            password: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <StyledForm>
              
              <div>
                <Heading1>Registro de usuario</Heading1>
                <Paragraph1>Registrese para poder acceder a las funcionalidades de nuestro sitio</Paragraph1>
              </div>
              
              {errors.general && <StyledErrorMessage>{errors.general}</StyledErrorMessage>}
              
              <TextInput
                type="text"
                label="Nombre de usuario"
                name="userName"
                placeholder="Nombre de usuario"
              />

              <TextInput
                type="email"
                label="Correo electrónico"
                name="email"
                placeholder="Correo electrónico"
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
                content={isSubmitting ? <TailSpin stroke="#000000" /> : 'Registrarse'}
                secondary
              />
            </StyledForm>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Register;
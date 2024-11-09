import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import backgroundImage from './background.png';
import * as Yup from "yup";

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

const RootContainer = styled.div`
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  padding: 80px 20px 20px 20px;
`;

const ProfileContainer = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: 100px auto;
  position: relative;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;  
  margin-top: 2rem;
`;

const InfoText = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const AdminTag = styled.span`
  background-color: #28a745; /* Verde */
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 10px;
  font-size: 0.9rem;
`;

const ErrorMessage = styled.div`
  color: #ff3333;
  font-weight: bold;
  margin-top: 10px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

const InputField = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px 0px 10px 10px;
`;

const UpdateButton = styled.button`
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 180px;

  &:hover {
    background-color: #218838;
  }
`;

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/me`, { withCredentials: true });
      console.log(response.data);
      setProfileData(response.data);
    } catch (err) {
      setError('Error al cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(); // Llamada inicial para obtener el perfil cuando se carga el componente
  }, []);



// Validación para el email
const emailValidationSchema = Yup.object({
  email: Yup.string()
    .email('Formato de email inválido')
    .required('El correo electrónico es obligatorio'),
});

// Validación para la contraseña
const passwordValidationSchema = Yup.object({
  password: Yup.string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .matches(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .matches(/[a-z]/, 'Debe contener al menos una letra minúscula')
    .matches(/\d/, 'Debe contener al menos un número')
    .matches(/[^A-Za-z0-9\s]/, 'Debe contener al menos un símbolo especial (e.g. @, $, !, %, *, ?, &)')
    .required('La contraseña es obligatoria'),
});

const handleUpdateEmail = async (e) => {
  e.preventDefault();
  setUpdateError(null);
  setUpdateSuccess(null);

  // Validación de email
  try {
    await emailValidationSchema.validate({ email: newEmail }); // Solo valida el email
  } catch (validationError) {
    return setUpdateError(validationError.message); // Muestra el mensaje de error si no cumple
  }

  try {
    await axios.put(`${backendUrl}/api/user/update/me`, {
      userId: profileData.id,
      newEmail: newEmail,
      newPassword: profileData.password,
    }, { withCredentials: true });

    setUpdateSuccess('Email actualizado correctamente.');
    setNewEmail('');

    // Actualizo los datos del perfil
    fetchProfile();
  } catch (err) {
    setUpdateError('Error al actualizar el email.');
  }
};

const handleUpdatePassword = async (e) => {
  e.preventDefault();
  setUpdateError(null);
  setUpdateSuccess(null);

  // Validación de contraseña
  try {
    await passwordValidationSchema.validate({ password: newPassword }); // Solo valida la contraseña
  } catch (validationError) {
    return setUpdateError(validationError.message); // Muestra el mensaje de error si no cumple
  }

  try {
    await axios.put(`${backendUrl}/api/user/update/me`, {
      userId: profileData.id,
      newEmail: profileData.email,
      newPassword: newPassword,
    }, { withCredentials: true });

    setUpdateSuccess('Contraseña actualizada correctamente.');
    setNewPassword('');

    // Actualizo los datos del perfil
    fetchProfile();
  } catch (err) {
    setUpdateError('Error al actualizar la contraseña.');
  }
};


  return (
    <>
      <RootContainer />
      <ProfileContainer>
        <SectionTitle>
          Mi Perfil
          {profileData?.isAdmin === 1 && <AdminTag>Admin</AdminTag>}
        </SectionTitle>
        {loading && <div>Cargando...</div>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!loading && profileData ? (
          <>
            <InfoText><strong>Nombre de usuario:</strong> {profileData.user_name}</InfoText>
            <InfoText><strong>Email:</strong> {profileData.email}</InfoText>

            <SectionTitle>Estadísticas</SectionTitle>
            <InfoText><strong>Publicaciones validadas:</strong> {profileData.validated_posts}</InfoText>
            <InfoText><strong>Publicaciones pendientes de validación:</strong> {profileData.unvalidated_posts}</InfoText>
            <InfoText><strong>Reseñas realizadas:</strong> {profileData.total_reviews}</InfoText>
         
            <SectionTitle>Actualizar información</SectionTitle>
            {updateSuccess && <div>{updateSuccess}</div>}
            {updateError && <ErrorMessage>{updateError}</ErrorMessage>}
            
            <form onSubmit={handleUpdateEmail}>
              <InputField 
                type="email" 
                placeholder="Nuevo email" 
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
                required 
              />
              <UpdateButton type="submit">Actualizar Email</UpdateButton>
            </form>
            
            <form onSubmit={handleUpdatePassword}>
              <InputField 
                type="password" 
                placeholder="Nueva contraseña" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
              />
              <UpdateButton type="submit">Actualizar Contraseña</UpdateButton>
            </form>
          </>
        ) : (
          !loading && <InfoText>No hay datos disponibles.</InfoText>
        )}
      </ProfileContainer>
    </>
  );
}

export default Profile;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const PostContainer = styled.div`
  padding: 80px 20px 20px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const PostContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PostTitle = styled.h1`
  margin: 0 0 20px 0;
  color: #333;
`;

const PostMeta = styled.div`
  color: #666;
  font-size: 0.9em;
  margin-bottom: 20px;
`;

const PostBody = styled.div`
  line-height: 1.6;
  color: #333;
`;

const PostImage = styled.img`
  max-width: 100%;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &.edit {
    background-color: #4CAF50;
    color: white;
  }
  
  &.delete {
    background-color: #f44336;
    color: white;
  }
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Textarea = styled.textarea`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 150px;
`;

function SinglePost() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [editedImage, setEditedImage] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/posts/${id}`, {
          withCredentials: true
        });
        setPost(response.data);
        
        const userResponse = await axios.get(`http://localhost:8080/api/user`, { withCredentials: true });
        setCurrentUserId(userResponse.data.id); 
        
        setEditedTitle(response.data.title);
        setEditedBody(response.data.body);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar la publicación');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleImageChange = (e) => {
    setEditedImage(e.target.files[0]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('title', editedTitle);
    formData.append('body', editedBody);
    if (editedImage) {
      formData.append('image', editedImage);
    }
  
    try {
      await axios.put(`http://localhost:8080/api/posts/${id}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      //const newImageUrl = editedImage ? `${URL.createObjectURL(editedImage)}?${new Date().getTime()}` : post.image;
  
      //TODO: Reemplazar URL cuando deployemos el sitio
      const response = await axios.get(`http://localhost:8080/api/posts/${id}`, { withCredentials: true });
      setPost(response.data);
      setIsEditing(false);
    } catch (err) {
      setError('Error al actualizar la publicación');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      try {
        await axios.delete(`http://localhost:8080/api/posts/${id}`, {
          withCredentials: true
        });
        navigate('/home');
      } catch (err) {
        setError('Error al eliminar la publicación');
      }
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>Publicación no encontrada</div>;

  return (
    <PostContainer>
      <PostContent>
        {isEditing ? (
          <EditForm onSubmit={handleSave}>
            <Input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
            <Textarea
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
            />
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <div>
              <Button type="submit" className="edit">Guardar</Button>
              <Button type="button" onClick={() => setIsEditing(false)}>Cancelar</Button>
            </div>
          </EditForm>
        ) : (
          <>
            <PostTitle>{post.title}</PostTitle>
            <PostMeta>
              Por {post.user_name} • {new Date(post.created_at).toLocaleDateString()}
            </PostMeta>
            {post.image && <PostImage src={`http://localhost:8080${post.image}`} alt="Imagen de la publicación" />}
            <PostBody>{post.body}</PostBody>
            {currentUserId === post.user_id && (
              <div style={{ marginTop: '20px' }}>
                <Button className="edit" onClick={handleEdit}>Editar</Button>
                <Button className="delete" onClick={handleDelete}>Eliminar</Button>
              </div>
            )}
          </>
        )}
      </PostContent>
    </PostContainer>
  );
}

export default SinglePost;
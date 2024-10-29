import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    paddingTop: '80px', // Adjust this value based on your navbar height
    backgroundColor: '#f0f2f5',
  },
  container: {
    width: '100%',
    maxWidth: '800px',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    margin: '0 0 10px 0',
    color: '#333',
  },
  meta: {
    color: '#666',
    fontSize: '0.9em',
    marginBottom: '10px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '10px',
    marginTop: '10px',
  },
  validateButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    padding: '10px',
  },
  validationMessage: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: '10px',
  },
};

export default function PostListToValidate() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchPostsAndUser = async () => {
      try {
        const [postsResponse, userResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/posts/to-validate', { withCredentials: true }),
          axios.get('http://localhost:8080/api/user', { withCredentials: true })
        ]);
        setPosts(postsResponse.data);
        setCurrentUser(userResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading data');
        setLoading(false);
      }
    };

    fetchPostsAndUser();
  }, []);

  const handleValidatePost = async (postId) => {
    try {
      await axios.put(`http://localhost:8080/api/posts/${postId}/validate`, {}, {
        withCredentials: true
      });
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, validated: 1 } : post
      ));
    } catch (err) {
      console.error("Error validating the post", err);
      setError('Error validating the post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!currentUser) {
      setError('User information not available');
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/posts/${postId}`, {
        withCredentials: true,
        data: { isAdmin: currentUser.isAdmin }
      });
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      console.error("Error deleting the post", err);
      setError('Error deleting the post: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div style={styles.pageContainer}><div style={styles.container}>Loading...</div></div>;
  if (error) return <div style={styles.pageContainer}><div style={styles.container}><div style={styles.error}>{error}</div></div></div>;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        {posts.map(post => (
          <div key={post.id} style={styles.card}>
            <h2 style={styles.title}>
              <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {post.title}
              </Link>
            </h2>
            <div style={styles.meta}>
              By {post.user_name} • {new Date(post.created_at).toLocaleDateString()}
            </div>
            <p>{post.body.substring(0, 150)}...</p>
            {post.validated === 0 && (
              <div style={styles.validationMessage}>Validación pendiente</div>
            )}
            <div style={styles.buttonContainer}>
              {post.validated === 0 && (
                <button 
                  style={styles.validateButton}
                  onClick={() => handleValidatePost(post.id)}
                >
                  Validar
                </button>
              )}
              <button 
                style={styles.deleteButton}
                onClick={() => handleDeletePost(post.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Llamada a la API backend
    axios.get('http://localhost:8080/api')
      .then(response => {
        setMessage(response.data);
      })
      .catch(error => {
        console.error('Error al conectar con el backend:', error);
      });
  }, []);

  return (
    <div className="App">
      <h1>Conexión entre React y Node.js</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;

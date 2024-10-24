const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true
}));

app.use(session({
    secret: 'mySuperSecretKey123!', 
    resave: false,                  
    saveUninitialized: false,      
    cookie: { secure: false }   
}));


//--------------- ENDPOINTS (ORDENAR) ----------------------

app.post('/api/register', (req, res) => {
    const { userName, email, password } = req.body;

    // Validación de la contraseña
    const passwordRegex = /^(?=.*[a-zA-ZÀ-ÿ])(?=.*[A-ZÀ-ÿ])(?=.*\d)(?=.*[@$!%*?&])[A-Za-zÀ-ÿ\d@$!%*?&]{12,}$/;

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error: 'La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un símbolo.'
        });
    }

    // Consulta para verificar si el correo electrónico o el nombre de usuario ya están registrados
    const checkUserOrEmailSql = `SELECT * FROM users WHERE email = ? OR user_name = ?`;

    db.get(checkUserOrEmailSql, [email, userName], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            // Si el correo o el nombre de usuario ya existe, enviamos un error
            if (row.email === email && row.user_name === userName) {
                return res.status(400).json({ error: 'El correo y el nombre de usuario ya están registrados.' });
            } else if (row.email === email) {
                return res.status(400).json({ error: 'El correo ya está registrado.' });
            } else if (row.user_name === userName) {
                return res.status(400).json({ error: 'El nombre de usuario ya está registrado.' });
            }
        }

        // Si el correo y el usuario no existen, procedemos a registrar el nuevo usuario
        const insertSql = `INSERT INTO users (user_name, email, password) VALUES (?, ?, ?)`;
        db.run(insertSql, [userName, email, password], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Establecer la sesión con el ID del usuario registrado
            req.session.usuarioId = this.lastID; 
            res.status(201).json({ id: this.lastID, userName, email, password });
        });
    });
});




const verificarAutenticacion = (req, res, next) => {
    if (req.session && req.session.usuarioId) {
        next();
    } else {
        res.status(401).json({ error: 'No autorizado' });
    }
};

app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;
    // Realiza una única consulta para verificar el email y la contraseña
    const sql = `
        SELECT * FROM users 
        WHERE email = ? OR user_name = ?`;

    db.get(sql, [usuario, usuario], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            // El correo no existe
            return res.status(404).json({ error: 'El usuario no está registrado.' });
        }

        // Si el correo existe, verifica la contraseña
        if (row.password !== password) {
            // La contraseña es incorrecta
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // Si las credenciales son correctas, establece la sesión
        req.session.usuarioId = row.id;
        res.json({ message: 'Inicio de sesión exitoso', userName: row.user_name });
    });
});

  


app.get('/api/user', verificarAutenticacion, (req, res) => {
    const sql = `SELECT * FROM users WHERE id = ?`;
    db.get(sql, [req.session.usuarioId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
});

app.post('/api/user/clear', (req, res) => {
    const sql = `DELETE FROM users`;

    db.run(sql, (err) => { // Utilizamos db.run en lugar de db.get porque no estamos esperando un resultado específico
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Todos los usuarios han sido eliminados correctamente.' });
    });
});

// Endpoint para cerrar la sesión
app.post('/api/logout', (req, res) => {
    // Destruye la sesión del usuario
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'No se pudo cerrar la sesión' });
        }
        res.clearCookie('connect.sid'); // Limpia la cookie de la sesión
        res.status(200).json({ message: 'Sesión cerrada correctamente' });
    });
});



app.post('/api/posts', verificarAutenticacion, (req, res) => {
    console.log('Received post request:', req.body);
    console.log('User ID from session:', req.session.usuarioId);
    const { title, body } = req.body;
    const userId = req.session.usuarioId;

    if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
    }

    const sql = `INSERT INTO posts (user_id, title, body, created_at) VALUES (?, ?, ?, datetime('now'))`;
    
    db.run(sql, [userId, title, body], function(err) {
        if (err) {
            console.error('Error creating post:', err);
            return res.status(500).json({ error: 'Error al crear la publicación' });
        }
        
        res.status(201).json({
            id: this.lastID,
            user_id: userId,
            title,
            body,
            created_at: new Date().toISOString()
        });
    });
});




// Cierra la conexión a la base de datos al finalizar el servidor
app.on('exit', () => {
    db.close();
});

// Inicia el servidor
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

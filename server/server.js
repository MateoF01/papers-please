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
    credentials: true                // Permitir el uso de cookies y sesiones
}));

// Configurar sesiones
app.use(session({
    secret: 'mySuperSecretKey123!', 
    resave: false,                  
    saveUninitialized: false,      
    cookie: { secure: false }   
}));


//--------------- ENDPOINTS (ORDENAR) ----------------------

app.post('/api/registrar', (req, res) => {
    const { userName, email, password } = req.body;

    // Verificar si el email ya está registrado
    const checkEmailSql = `SELECT * FROM users WHERE email = ?`;
    db.get(checkEmailSql, [email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            // Si el correo ya existe, enviamos un error
            return res.status(400).json({ error: 'El correo ya está registrado.' });
        }

        // Si el correo no existe, procedemos a registrar el nuevo usuario
        const insertSql = `INSERT INTO users (user_name, email, password) VALUES (?, ?, ?)`;
        db.run(insertSql, [userName, email, password], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Establecer la sesión con el ID del usuario registrado
            req.session.usuarioId = this.lastID; 
            res.status(201).json({ id: this.lastID, userName });
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


app.get('/api/usuario', verificarAutenticacion, (req, res) => {
    const sql = `SELECT * FROM users WHERE id = ?`;
    db.get(sql, [req.session.usuarioId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
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

// Cierra la conexión a la base de datos al finalizar el servidor
app.on('exit', () => {
    db.close();
});

// Inicia el servidor
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

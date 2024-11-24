require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

const app = express();
const db = new sqlite3.Database('./database.db');



app.use(bodyParser.json());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://papers-please.netlify.app' : 'http://localhost:3000',
    //origin: process.env.NODE_ENV === 'production' ? 'https://papers-please-corp.github.io' : 'http://localhost:3000',
    credentials: true
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.NODE_ENV === 'production' ? 'https://papers-please.netlify.app' : 'http://localhost:3000');
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, DELETE"
    );
    next();
  });

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        domain: process.env.NODE_ENV === 'production' ? '.papers-please.netlify.app' : null,
        //domain: process.env.NODE_ENV === 'production' ? '.papers-please-corp.github.io' : null,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : false,
        path: '/'
    }
}));

app.use('/uploads', express.static('uploads'));

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: './uploads', 
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });


//--------------- ENDPOINTS (ORDENAR) ----------------------




// Endpoint agregar tag
app.post('/api/tags', (req, res) => {
    const { tagName } = req.body;

    if (!tagName) {
        return res.status(400).json({ error: 'Tag name is required' });
    }

    const query = `INSERT INTO tags (name) VALUES (?)`;
    db.run(query, [tagName], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error adding tag' });
        }
        res.json({ message: 'Tag added successfully', tag: { id: this.lastID, name: tagName } });
    });
});

// Endpoint get tags
app.get('/api/tags', (req, res) => {
    const query = `SELECT * FROM tags`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching tags' });
        }
        res.json(rows);
    });
});

// Chat con IA de openai
app.post('/api/chat', async (req, res) => {
    try {
      const { messages, context } = req.body;
  
      // Contexto de sistema
      const systemMessage = { role: "system", content: context || `Sos un asistente virtual de una plataforma de papers academicos llamado EinsteinBot, 
        hablas solo en español rioplatense usando voseo verbal, te limitas a habla sobre
        0|matemática
        1|ciencia
        2|filosofía
        3|historia
        4|literatura
        5|tecnologia
        6|arte
        7|politica
        8|economia
        9|psicologia,
        no respondes preguntas que no esten relacionadas con esos temas academicos,
        envia emojis relacionados a lo que decis junto con tus respuestas` };
      const fullMessages = [systemMessage, ...messages];
  
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: fullMessages,
      });
  
      res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
      console.error('Error in chat API:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  });


app.post('/api/register', (req, res) => {
    const { userName, email, password } = req.body;
0
    // Validación de la contraseña
    const passwordRegex = /^(?=.*[a-zA-ZÀ-ÿ])(?=.*[A-ZÀ-ÿ])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{12,}$/;
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
        console.log('Set-Cookie header:', res.get('Set-Cookie'));
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

  
app.get('/api/users', (req, res) => {
    const sql = `SELECT * FROM users`;
    db.all(sql, (err, rows) => {  // Cambia db.get por db.all
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);  // Envía todas las filas obtenidas
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

app.put('/api/user/update/me', verificarAutenticacion, (req, res) => {

    const { userId, newEmail, newPassword } = req.body;

    // Validación de la contraseña
    const passwordRegex = /^(?=.*[a-zA-ZÀ-ÿ])(?=.*[A-ZÀ-ÿ])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{12,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            error: 'La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un símbolo.'
        });
    }

    // Consulta para verificar si el correo electrónico ya esta registrado
    const checkUserOrEmailSql = `SELECT * FROM users WHERE email = ? AND id <> ?`;
    db.get(checkUserOrEmailSql, [newEmail, userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
        }

        if (row) {
            return res.status(400).json({ error: 'El correo electrónico ya esta registrado' });
        }

        // Actualización de datos si las validaciones pasaron
        const sql = `
        UPDATE users
        SET email = ?, password = ?
        WHERE id = ?;
        `;

        db.run(sql, [ newEmail, newPassword, userId ], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json({ message: 'Información actualizada con éxito' });
        });
    });
});


app.get('/api/user/me', verificarAutenticacion, (req, res) => {
    const userId = req.session.usuarioId;

    const sql = `
    SELECT 
        u.user_name, 
        u.email, 
        u.password, 
        u.isAdmin,
        u.id,
        COUNT(CASE WHEN p.validated = 1 THEN 1 END) AS validated_posts,
        COUNT(CASE WHEN p.validated = 0 THEN 1 END) AS unvalidated_posts,
        COUNT(r.id) AS total_reviews
    FROM 
        users u
    LEFT JOIN 
        posts p ON u.id = p.user_id
    LEFT JOIN 
        reviews r ON u.id = r.user_id
    WHERE 
        u.id = ?
    GROUP BY 
        u.id, u.user_name, u.email, u.password, u.isAdmin;
    `;

    db.get(sql, [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
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


// Endpoint to create a new post
app.post('/api/posts', verificarAutenticacion, upload.single('image'), (req, res) => {
    console.log('Received post request:', req.body);
    console.log('User ID from session:', req.session.usuarioId);
    const { title, body, tags } = req.body;
    const userId = req.session.usuarioId;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
    }

    if (!tags) {
        return res.status(400).json({ error: 'At least one Tag is required' });
    }

    let tagsArray;
    try {
        tagsArray = JSON.parse(tags);
    } catch (error) {
        return res.status(400).json({ error: 'Invalid tags format' });
    }

    let tagsValue = 0;
    if (Array.isArray(tagsArray)) {
        const tagIds = tagsArray.map(tagId => parseInt(tagId));
        const query = `SELECT id FROM tags WHERE id IN (${tagIds.join(',')})`;
        db.all(query, [], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching tags' });
            }
            rows.forEach(row => {
                tagsValue |= (1 << row.id);  // Sumar el valor de la etiqueta usando OR bitwise
            });

            const sql = `INSERT INTO posts (user_id, title, body, image, tags, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`;

            db.run(sql, [userId, title, body, imagePath, tagsValue], function(err) {
                if (err) {
                    console.error('Error creating post:', err);
                    return res.status(500).json({ error: 'Error al crear la publicación' });
                }

                res.status(201).json({
                    id: this.lastID,
                    user_id: userId,
                    title,
                    body,
                    image: imagePath,
                    tags: tagsValue,
                    created_at: new Date().toISOString()
                });
            });
        });
    } else {
        return res.status(400).json({ error: 'Tags should be an array' });
    }
});


// Me traigo todos los posteo con orden
app.get('/api/posts', (req, res) => {
    const { orderBy = 'created_at', order = 'DESC' } = req.query;

    const validOrderTypes = ['created_at', 'title', 'user_name'];
    const validOrderDirections = ['ASC', 'DESC'];

    if (!validOrderTypes.includes(orderBy) || !validOrderDirections.includes(order.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid order parameters' });
    }

    const sql = `
        SELECT posts.*, users.user_name, users.isAdmin as user_isAdmin
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        ORDER BY ${orderBy} ${order.toUpperCase()}
    `;

    db.all(sql, [], (err, posts) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const tagQuery = `SELECT * FROM tags`;
        db.all(tagQuery, [], (err, tags) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching tags' });
            }

            const tagMap = {};
            tags.forEach(tag => {
                tagMap[tag.id] = tag.name;
            });

            const postsWithTags = posts.map(post => {
                const decodedTags = Object.keys(tagMap).filter(tagId => (post.tags & (1 << tagId)) !== 0);
                return {
                    ...post,
                    tags: decodedTags.map(Number)
                };
            });

            res.json(postsWithTags);
        });
    });
});

// Obtener publicaciones pendientes de validación
app.get('/api/posts/to-validate', (req, res) => {
    const { orderBy = 'created_at', order = 'DESC' } = req.query;

    const validOrderTypes = ['created_at', 'title', 'user_name'];
    const validOrderDirections = ['ASC', 'DESC'];

    if (!validOrderTypes.includes(orderBy) || !validOrderDirections.includes(order.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid order parameters' });
    }

    const sql = `
        SELECT posts.*, users.user_name 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        WHERE posts.validated = 0 
        ORDER BY ${orderBy} ${order.toUpperCase()}
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const tagQuery = `SELECT * FROM tags`;
        db.all(tagQuery, [], (err, tags) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching tags' });
            }

            const tagMap = {};
            tags.forEach(tag => {
                tagMap[tag.id] = tag.name;
            });

            const postsWithTags = rows.map(post => {
                const decodedTags = Object.keys(tagMap).filter(tagId => (post.tags & (1 << tagId)) !== 0);
                return {
                    ...post,
                    tags: decodedTags.map(Number)
                };
            });

            res.json(postsWithTags);
        });
    });
});

// Validar una publicación específica
app.put('/api/posts/:postId/validate', (req, res) => {
    const { postId } = req.params;
    const sql = `
        UPDATE posts 
        SET validated = 1 
        WHERE id = ?
    `;
    
    db.run(sql, [postId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        res.json({ message: 'Publicación validada exitosamente' });
    });
});


// Traigo un posteo individual
app.get('/api/posts/:id', (req, res) => {
    const sql = `
        SELECT posts.*, users.user_name, users.isAdmin as user_isAdmin
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        WHERE posts.id = ?
    `;
    
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const tagQuery = `SELECT * FROM tags`;
        db.all(tagQuery, [], (err, tags) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching tags' });
            }

            const tagMap = {};
            tags.forEach(tag => {
                tagMap[tag.id] = tag.name;
            });

            const decodedTags = Object.keys(tagMap).filter(tagId => (row.tags & (1 << tagId)) !== 0).map(Number);

            res.json({
                ...row,
                tags: decodedTags  // Array de IDs de tags
            });
        });
    });
});

// Traigo posteos del usuario loggeado
app.get('/api/posts/user/me', verificarAutenticacion, (req, res) => {
    const { orderBy = 'created_at', order = 'DESC' } = req.query;

    const validOrderTypes = ['created_at', 'title', 'user_name'];
    const validOrderDirections = ['ASC', 'DESC'];

    if (!validOrderTypes.includes(orderBy) || !validOrderDirections.includes(order.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid order parameters' });
    }

    const sql = `
        SELECT posts.*, users.user_name 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        WHERE posts.user_id = ? 
        ORDER BY ${orderBy} ${order.toUpperCase()}
    `;

    db.all(sql, [req.session.usuarioId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const tagQuery = `SELECT * FROM tags`;
        db.all(tagQuery, [], (err, tags) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching tags' });
            }

            const tagMap = {};
            tags.forEach(tag => {
                tagMap[tag.id] = tag.name;
            });

            const postsWithTags = rows.map(post => {
                const decodedTags = Object.keys(tagMap).filter(tagId => (post.tags & (1 << tagId)) !== 0);
                return {
                    ...post,
                    tags: decodedTags.map(Number)
                };
            });

            res.json(postsWithTags);
        });
    });
});

// Endpoint to update a post
app.put('/api/posts/:id', verificarAutenticacion, upload.single('image'), (req, res) => {
    let { title, body, tags } = req.body;

    const newImagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Valido que el posteo pertenezca al usuario loggeado
    db.get('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (row.user_id !== req.session.usuarioId) {
            return res.status(403).json({ error: 'Not authorized to update this post' });
        }

        // Parse tags if they are sent as a JSON string
        let tagsArray;
        try {
            tagsArray = JSON.parse(tags);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid tags format' });
        }

        // Calcular el valor de tags; si `tags` está vacío o no se envía, `tagsValue` será 0
        let tagsValue = 0;
        if (Array.isArray(tagsArray) && tagsArray.length > 0) {
            const tagIds = tagsArray.map(tagId => parseInt(tagId));
            const query = `SELECT id FROM tags WHERE id IN (${tagIds.join(',')})`;
            db.all(query, [], (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: 'Error fetching tags' });
                }
                rows.forEach(row => {
                    tagsValue |= (1 << row.id);  // Sumar el valor de la etiqueta usando OR bitwise
                });

                // Actualizar la publicación en la base de datos
                const sql = `UPDATE posts SET title = ?, body = ?, tags = ?, validated = 0, image = COALESCE(?, image) WHERE id = ?`;
                db.run(sql, [title, body, tagsValue, newImagePath, req.params.id], function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    // Eliminar la imagen anterior si se ha cargado una nueva
                    if (newImagePath && row.image) {
                        const oldImagePath = `./uploads/${path.basename(row.image)}`;
                        fs.unlink(oldImagePath, (unlinkErr) => {
                            if (unlinkErr) console.error('Error deleting old image:', unlinkErr);
                        });
                    }

                    res.status(200).json({ message: 'Post updated successfully' });
                });
            });
        } else {
            // Actualizar la publicación en la base de datos sin cambiar las etiquetas
            const sql = `UPDATE posts SET title = ?, body = ?, validated = 0, image = COALESCE(?, image) WHERE id = ?`;
            db.run(sql, [title, body, newImagePath, req.params.id], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Eliminar la imagen anterior si se ha cargado una nueva
                if (newImagePath && row.image) {
                    const oldImagePath = `./uploads/${path.basename(row.image)}`;
                    fs.unlink(oldImagePath, (unlinkErr) => {
                        if (unlinkErr) console.error('Error deleting old image:', unlinkErr);
                    });
                }

                res.status(200).json({ message: 'Post updated successfully' });
            });
        }
    });
});

// Borro un posteo
app.delete('/api/posts/:id', verificarAutenticacion, (req, res) => {
    const postId = req.params.id;
    const userId = req.session.usuarioId;
    const isAdmin = req.body.isAdmin === 1;

    db.get('SELECT user_id FROM posts WHERE id = ?', [postId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (row.user_id !== userId && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }
        
        const deleteCommentsSql = `DELETE FROM reviews WHERE post_id = ?`;
        db.run(deleteCommentsSql, [postId], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // y el post.
            const deletePostSql = `DELETE FROM posts WHERE id = ?`;
            db.run(deletePostSql, [postId], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Post and associated reviews deleted successfully' });
            });
        });
        // const sql = `DELETE FROM posts WHERE id = ?`;
        // db.run(sql, [postId], function(err) {
        //     if (err) {
        //         return res.status(500).json({ error: err.message });
        //     }
        //     res.json({ message: 'Post deleted successfully' });
        // });
    });
});

// cargar reseña
app.post('/api/posts/:postId/reviews', 
    verificarAutenticacion,
    [
      check('rating').isInt({ min: 1, max: 5 }),
      check('comment').optional().isString()
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { postId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.session.usuarioId;
  
      const sql = `INSERT INTO reviews (user_id, post_id, rating, comment) VALUES (?, ?, ?, ?)`;
      db.run(sql, [userId, postId, rating, comment], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          id: this.lastID,
          user_id: userId,
          post_id: postId,
          rating,
          comment,
          created_at: new Date().toISOString()
        });
      });
    }
  );
  
  // obtener reseñas
  app.get('/api/posts/:postId/reviews', (req, res) => {
    const { postId } = req.params;
    const sql = `
      SELECT reviews.*, users.user_name
      FROM reviews 
      JOIN users ON reviews.user_id = users.id 
      WHERE reviews.post_id = ?
      ORDER BY reviews.created_at DESC
    `;
    
    db.all(sql, [postId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });



// Editar reseña
app.put('/api/reviews/:reviewId', verificarAutenticacion, [
    check('rating').isInt({ min: 1, max: 5 }),
    check('comment').optional().isString()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.session.usuarioId;
  
    // First, check if the review belongs to the user
    db.get('SELECT * FROM reviews WHERE id = ?', [reviewId], (err, review) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }
      if (review.user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to edit this review' });
      }
  
      // If authorized, update the review
      const sql = `UPDATE reviews SET rating = ?, comment = ? WHERE id = ?`;
      db.run(sql, [rating, comment, reviewId], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Review updated successfully' });
      });
    });
  });
  
  // borrar reseña
  app.delete('/api/reviews/:reviewId', verificarAutenticacion, (req, res) => {
    const { reviewId } = req.params;
    const userId = req.session.usuarioId;
  

    db.get('SELECT isAdmin FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (user.isAdmin) {

        deleteReview(reviewId, res);
      } else {

        db.get('SELECT * FROM reviews WHERE id = ?', [reviewId], (err, review) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          if (!review) {
            return res.status(404).json({ error: 'Review not found' });
          }
          if (review.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this review' });
          }
          
          deleteReview(reviewId, res);
        });
      }
    });
  });
  
  function deleteReview(reviewId, res) {
    const sql = `DELETE FROM reviews WHERE id = ?`;
    db.run(sql, [reviewId], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Review deleted successfully' });
    });
  }


////// intento poner foros

app.post('/api/forums', verificarAutenticacion, (req, res) => {
    console.log('Received post request:', req);
    console.log('User ID from session:', req.session.usuarioId);
    const { title, body } = req.body;
    const userId = req.session.usuarioId;
    // const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
    }
    
    db.serialize(() => {
    // Crear la tabla forums si no existe
    db.run(`
      CREATE TABLE IF NOT EXISTS forums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar un nuevo foro
    const sql = `INSERT INTO forums (user_id, title, body, created_at) VALUES (?, ?, ?, datetime('now'))`;
    db.run(sql, [userId, title, body], function(err) {
        if (err) {
            console.error('Error creating forum:', err);
            return res.status(500).json({ error: 'Error al crear el foro' });
        }
        console.log(`A new forum was created with ID ${this.lastID}`);
        res.status(201).json({
        id: this.lastID,
        user_id: userId,
        title,
        body,
        created_at: new Date().toISOString()
        })
    });
  });
});
   
// Me traigo todos los foros con orden
app.get('/api/forums', (req, res) => {

    const { orderBy = 'created_at', order = 'DESC' } = req.query;

    const validOrderTypes = ['created_at', 'title', 'user_name'];
    const validOrderDirections = ['ASC', 'DESC'];

    if (!validOrderTypes.includes(orderBy) || !validOrderDirections.includes(order.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid order parameters' });
    }
    
    const sql = `
        SELECT forums.*, users.user_name, users.isAdmin as user_isAdmin
        FROM forums
        JOIN users ON forums.user_id = users.id 
        ORDER BY ${orderBy} ${order.toUpperCase()}
    `;
    

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        console.log(rows);
        res.json(rows);
    });
});

// Traigo un foro individual
app.get('/api/forums/:id', (req, res) => {
    const sql = `
        SELECT forums.*, users.user_name, users.isAdmin as user_isAdmin
        FROM forums 
        JOIN users ON forums.user_id = users.id 
        WHERE forums.id = ?
    `;
    
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Forum not found' });
        }
        res.json(row);
    });
});

// Modifico un Foro
app.put('/api/forums/:id', verificarAutenticacion, (req, res) => {
    const { title, body } = req.body;

    // Valido que el posteo pertenezca al usuario loggeado
    db.get('SELECT * FROM forums WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Forum not found' });
        }
        if (row.user_id !== req.session.usuarioId) {
            return res.status(403).json({ error: 'Not authorized to update this post' });
        }

        // Actualizar la publicación en la base de datos
        const sql = `UPDATE forums SET title = ?, body = ? WHERE id = ?`;
        db.run(sql, [title, body, req.params.id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.json({ message: 'Forum updated successfully' });
        });
    });
});

// Borro un foro
app.delete('/api/forums/:id', verificarAutenticacion, (req, res) => {
    const forumId = req.params.id;
    const userId = req.session.usuarioId;
    const isAdmin = req.body.isAdmin === 1;

    db.get('SELECT user_id FROM forums WHERE id = ?', [forumId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Forum not found' });
        }
        if (row.user_id !== userId && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized to delete this forum' });
        }
        
        const deleteCommentsSql = `DELETE FROM comments WHERE forum_id = ?`;
        db.run(deleteCommentsSql, [forumId], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // ahora borro el foro
            const deleteForumSql = `DELETE FROM forums WHERE id = ?`;
            db.run(deleteForumSql, [forumId], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Forum and associated comments deleted successfully' });
            });
        });
    });
});

// cargar comentario a foro
app.post('/api/forums/:forumId/comments', 
    verificarAutenticacion,
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { forumId } = req.params;
      const { comment } = req.body;
      const userId = req.session.usuarioId;

      db.serialize(() => {
    // Crear la tabla comments si no existe
    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        forum_id INTEGER NOT NULL,
        body TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar un nuevo comentario
    const sql = `INSERT INTO comments (user_id, forum_id, body, created_at) VALUES (?, ?, ?, datetime('now'))`;
    db.run(sql, [userId, forumId, comment], function(err) {
        if (err) {
            console.error('Error creating comment:', err);
            return res.status(500).json({ error: 'Error al crear el comentario' });
        }
        console.log(`A new forum was created with ID ${this.lastID}`);
        res.status(201).json({
        id: this.lastID,
        user_id: userId,
        forum_id: forumId,
        comment,
        created_at: new Date().toISOString()
        })
    });
  });
});
      
  // obtener comentarios
  app.get('/api/forums/:forumId/comments', (req, res) => {
    const { forumId } = req.params;
    const sql = `
      SELECT comments.*, users.user_name
      FROM comments 
      JOIN users ON comments.user_id = users.id 
      WHERE comments.forum_id = ?
      ORDER BY comments.created_at DESC
    `;
    
    db.all(sql, [forumId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });


  // Modifico un comentario
app.put('/api/forums/:id/comments/:id', verificarAutenticacion, (req, res) => {
    const {body } = req.body;

    // Valido que el comentario pertenezca al usuario loggeado
    db.get('SELECT * FROM comments WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Forum not found' });
        }
        if (row.user_id !== req.session.usuarioId) {
            return res.status(403).json({ error: 'Not authorized to update this post' });
        }

        // Actualizar el comentario en la base de datos
        const sql = `UPDATE comments SET body = ? WHERE id = ?`
        db.run(sql, [body, req.params.id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.json({ message: 'Comment updated successfully' });
        });
    });
});

// Borro un comentario
app.delete('/api/forums/:id/comments/:id', verificarAutenticacion, (req, res) => {
    const commentId = req.params.id;
    const userId = req.session.usuarioId;
    const isAdmin = req.body.isAdmin === 1;

    db.get('SELECT user_id FROM comments WHERE id = ?', [commentId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (row.user_id !== userId && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }
        
        const sql = `DELETE FROM comments WHERE id = ?`;
        db.run(sql, [commentId], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Comment deleted successfully' });
        });
    });
});


// Endpoint agregar tag recomendado
app.post('/api/recommended-tags', verificarAutenticacion, (req, res) => {
    const { tag } = req.body;
    const userId = req.session.usuarioId;

    if (!tag) {
        return res.status(400).json({ error: 'Tag is required' });
    }

    const query = `INSERT INTO recommended_tags (user_id, tag) VALUES (?, ?)`;
    db.run(query, [userId, tag], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error adding recommended tag' });
        }
        res.json({ message: 'Recommended tag added successfully', tag: { id: this.lastID, user_id: userId, tag } });
    });
});

// Endpoint get tags recomendados
app.get('/api/recommended-tags', verificarAutenticacion, (req, res) => {
    const query = `SELECT recommended_tags.*, users.user_name FROM recommended_tags JOIN users ON recommended_tags.user_id = users.id`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching recommended tags' });
        }
        res.json(rows);
    });
});

// Endpoint aceptar tag recomendado
app.post('/api/recommended-tags/:id/accept', verificarAutenticacion, (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM recommended_tags WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching recommended tag' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Recommended tag not found' });
        }

        const insertTagQuery = `INSERT INTO tags (name) VALUES (?)`;
        db.run(insertTagQuery, [row.tag], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error adding tag' });
            }

            const deleteRecommendedTagQuery = `DELETE FROM recommended_tags WHERE id = ?`;
            db.run(deleteRecommendedTagQuery, [id], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error deleting recommended tag' });
                }
                res.json({ message: 'Tag accepted and added successfully' });
            });
        });
    });
});

// Endpoint denegar tag recomendado
app.delete('/api/recommended-tags/:id/deny', verificarAutenticacion, (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM recommended_tags WHERE id = ?`;
    db.run(query, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error deleting recommended tag' });
        }
        res.json({ message: 'Recommended tag denied and deleted successfully' });
    });
});


// Endpoint borrar tag
app.delete('/api/tags/:id', verificarAutenticacion, (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM tags WHERE id = ?`;
    db.run(query, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error deleting tag' });
        }
        res.json({ message: 'Tag deleted successfully' });
    });
});


// Cierra la conexión a la base de datos al finalizar el servidor
app.on('exit', () => {
    db.close();
});

// Inicia el servidor
const PORT = process.env.PORT || 8080; 
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});


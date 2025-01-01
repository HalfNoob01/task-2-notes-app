const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
    host: 'localhost',
    user: 'root', 
    password: ''   // Add your password here
};

const db = mysql.createConnection(dbConfig);

// Connect to MySQL
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');

    db.query('CREATE DATABASE IF NOT EXISTS notes_app', (err, result) => {
        if (err) throw err;
        console.log('Database ensured: notes_app');

        dbConfig.database = 'notes_app';
        const dbWithDatabase = mysql.createConnection(dbConfig);

        dbWithDatabase.connect((err) => {
            if (err) throw err;

            console.log('Switched to database: notes_app');

            // Ensure the notes table exists
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS notes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            dbWithDatabase.query(createTableQuery, (err, result) => {
                if (err) throw err;
                console.log('Notes table ensured in database');
            });

            app.locals.db = dbWithDatabase;
        });
    });
});


app.use((req, res, next) => {
    req.db = app.locals.db;
    next();
});

// Get all notes
app.get('/notes', (req, res) => {
    req.db.query('SELECT * FROM notes', (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Add a note
app.post('/notes', (req, res) => {
    const { title, description } = req.body;

    // Validate input
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    req.db.query('INSERT INTO notes (title, description) VALUES (?, ?)', [title, description], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: result.insertId, title, description });
    });
});

// Update a note
app.put('/notes/:id', (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    req.db.query('UPDATE notes SET title = ?, description = ? WHERE id = ?', [title, description, id], (err) => {
        if (err) throw err;
        res.json({ id, title, description });
    });
});

// Delete a note
app.delete('/notes/:id', (req, res) => {
    const { id } = req.params;

    req.db.query('DELETE FROM notes WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.sendStatus(204);
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

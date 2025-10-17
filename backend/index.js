const express = require('express');
const path = require('path'); // NEW: Import the 'path' module
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = require('./db');

// Initialize schema
async function initializeSchema() {
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        role VARCHAR(50) DEFAULT 'User',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create messages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database schema initialized');
  } catch (err) {
    console.warn('Could not initialize schema:', err.message);
  }
}

// Users API Routes
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, email, role = 'User' } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
      [name, email, role]
    );
    res.status(201).json({ id: result.insertId, name, email, role, status: 'active' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, id]
    );
    res.json({ id, status });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Contact Form API
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    await db.query(
      'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject, message]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Stats API
app.get('/api/stats', async (req, res) => {
  try {
    const [[totalUsers]] = await db.query('SELECT COUNT(*) as count FROM users');
    const [[activeUsers]] = await db.query('SELECT COUNT(*) as count FROM users WHERE status = ?', ['active']);
    const [[newUsersToday]] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()'
    );
    const [[totalMessages]] = await db.query('SELECT COUNT(*) as count FROM messages');

    res.json({
      totalUsers: totalUsers.count,
      activeUsers: activeUsers.count,
      newUsersToday: newUsersToday.count,
      totalMessages: totalMessages.count
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// =================================================================
// NEW: SERVE THE ANGULAR FRONTEND
// =================================================================

// Define the path to the compiled Angular application
const angularAppPath = path.join(__dirname, 'frontend/frontend-app/dist/frontend-app');

// Tell Express to serve static files from this path
app.use(express.static(angularAppPath));

// For any request that doesn't match an API route, send the index.html file
// This enables Angular's client-side routing (e.g., /dashboard, /profile)
// IMPORTANT: This route must be AFTER all your API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(angularAppPath, 'index.html'));
});


// Initialize schema and start server
const PORT = process.env.PORT || 3000;
initializeSchema().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
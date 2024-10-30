import express from 'express';
import mysql from 'mysql2/promise'; // Promise-based MySQL client
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // for generating tokens (optional, for real app security)

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MySQL
const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'adhesh',
  database: 'mentorship_db',
});

// Sign-In Route
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch the user from the database
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];

    // Check if the password matches (plain text here)
    const isPasswordValid = password === user.password; // If you have hashed passwords, use bcrypt.compare()

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Optionally, generate a token here (if you want to add JWT for secure sessions)
    // const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });

    // Successful sign-in, redirect to dashboard
    res.status(200).json({ message: 'Sign-in successful!', user: { username, email: user.email } });
  } catch (error) {
    console.error('Sign-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Existing sign-up route
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    await db.execute(query, [username, email, password]);

    res.status(201).json({ message: 'User registered successfully!', user: { username, email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

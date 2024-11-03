import express from 'express';
import mysql from 'mysql2/promise'; // Promise-based MySQL client
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs'; // For hashing passwords

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

// Helper function to validate ID number based on role
const validateIdNumber = (role, idnumber) => {
  if (role === 'Alumni' && idnumber.startsWith('ALU')) return true;
  if (role === 'Admin' && idnumber.startsWith('ADM')) return true;
  if (role === 'Student' && idnumber.startsWith('PES1UG')) return true;
  return false;
};

// Sign-Up Route
app.post('/signup', async (req, res) => {
  const { email, password, idnumber, role } = req.body;

  // Validate role-based ID number
  if (!validateIdNumber(role, idnumber)) {
    return res.status(400).json({ message: 'Invalid ID number for the specified role' });
  }

  try {
    // Check if ID number already exists (Primary Key constraint)
    const [existingUser] = await db.execute('SELECT * FROM loginuser WHERE idnumber = ?', [idnumber]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'ID number already exists' });
    }

    // Hash password for security
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const query = 'INSERT INTO loginuser (email, password, idnumber, role) VALUES (?, ?, ?, ?)';
    await db.execute(query, [email, password, idnumber, role]);

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Sign-In Route
app.post('/signin', async (req, res) => {
  const { idnumber, password, role } = req.body;

  try {
    // Fetch the user based on ID number and role
    const [rows] = await db.execute('SELECT * FROM loginuser WHERE idnumber = ? AND role = ?', [idnumber, role]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];

    // Compare the password with the stored password
    const isPasswordValid = (password === user.password); // Assuming password is stored as plaintext

    console.log(password, user.password, isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // No JWT token generation since it's optional
    res.status(200).json({
      message: 'Sign-in successful!',
      user: { email: user.email }
    });
  } catch (error) {
    console.error('Sign-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Student Details Route
app.post('/students', async (req, res) => {
  const { student_id, fname, lastname, branch } = req.body;

  try {
    // Fetch email associated with student_id from loginuser table
    const [userRows] = await db.execute('SELECT email FROM loginuser WHERE idnumber = ?', [student_id]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found in loginuser table' });
    }

    const email = userRows[0].email;

    // Insert data into students table
    const query = 'INSERT INTO students (student_id, email, fname, lastname, branch) VALUES (?, ?, ?, ?, ?)';
    await db.execute(query, [student_id, email, fname, lastname, branch]);

    res.status(201).json({ message: 'Student details added successfully!' });
  } catch (error) {
    console.error('Error adding student details:', error);
    res.status(500).json({ message: 'Error adding student details' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

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
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'adhesh',
  database: 'mentorship_db',
};

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
    const db = await mysql.createConnection(dbConfig);
    const [existingUser] = await db.execute('SELECT * FROM loginuser WHERE idnumber = ?', [idnumber]);

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'ID number already exists' });
    }

    // Hash password for security
    //const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const query = 'INSERT INTO loginuser (email, password, idnumber, role) VALUES (?, ?, ?, ?)';
    await db.execute(query, [email, password, idnumber, role]);

    res.status(201).json({ message: 'User registered successfully!' });
    await db.end(); // Close connection
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Sign-In Route
app.post('/signin', async (req, res) => {
  const { idnumber, password, role } = req.body;

  try {
    const db = await mysql.createConnection(dbConfig);
    // Fetch the user based on ID number and role
    const [rows] = await db.execute('SELECT * FROM loginuser WHERE idnumber = ? AND role = ?', [idnumber, role]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];

    // Compare the password with the stored hashed password
    const isPasswordValid = (password === user.password); 
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({
      message: 'Sign-in successful!',
      user: { email: user.email },
    });
    await db.end(); // Close connection
  } catch (error) {
    console.error('Sign-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Student Details Route
app.post('/students', async (req, res) => {
  const { student_id, fname, lastname, branch } = req.body;

  // Log the request body for debugging
  console.log('Received request body:', req.body);

  try {
    const db = await mysql.createConnection(dbConfig);

    // Check if student exists in the loginuser table
    const [userRows] = await db.execute('SELECT email FROM loginuser WHERE idnumber = ?', [student_id]);

    // Debug: log userRows
    console.log('User rows:', userRows);

    if (userRows.length === 0) {
      console.warn('User not found in loginuser table');
      return res.status(404).json({ message: 'User not found in loginuser table' });
    }

    const email = userRows[0].email;

    // Check if the student exists in the students table
    const [rows] = await db.execute('SELECT * FROM students WHERE student_id = ?', [student_id]);

    // Debug: log existing student rows
    console.log('Existing student rows:', rows);

    if (rows.length > 0) {
      // Update if exists
      const query = 'UPDATE students SET fname = ?, lastname = ?, branch = ? WHERE student_id = ?';
      await db.execute(query, [fname, lastname, branch, student_id]);
      console.log('Student details updated successfully');
      res.status(200).json({ message: 'Student details updated successfully!' });
    } else {
      // Insert if new
      const query = 'INSERT INTO students (student_id, email, fname, lastname, branch) VALUES (?, ?, ?, ?, ?)';
      await db.execute(query, [student_id, email, fname, lastname, branch]);
      console.log('Student details added successfully');
      res.status(201).json({ message: 'Student details added successfully!' });
    }

    await db.end(); // Close the database connection
  } catch (error) {
    console.error('Error saving student details:', error); // Log full error object for more detail
    res.status(500).json({ message: 'Error saving student details' });
  }
});

app.post('/alumni', async (req, res) => {
  const { alumni_id, fname, lastname, graduation_year, industry } = req.body;

  // Log the request body for debugging
  console.log('Received request body:', req.body);

  try {
    const db = await mysql.createConnection(dbConfig);

    // Check if the alumni exists in the loginuser table
    const [userRows] = await db.execute('SELECT email FROM loginuser WHERE idnumber = ?', [alumni_id]);

    // Debug: log userRows
    console.log('User rows:', userRows);

    if (userRows.length === 0) {
      console.warn('User not found in loginuser table');
      return res.status(404).json({ message: 'User not found in loginuser table' });
    }

    const email = userRows[0].email;

    // Check if the alumni exists in the alumni table
    const [rows] = await db.execute('SELECT * FROM alumni WHERE alumni_id = ?', [alumni_id]);

    // Debug: log existing alumni rows
    console.log('Existing alumni rows:', rows);

    if (rows.length > 0) {
      // Update if exists
      const query = 'UPDATE alumni SET fname = ?, lastname = ?, graduation_year = ?, industry = ? WHERE alumni_id = ?';
      await db.execute(query, [fname, lastname, graduation_year, industry, alumni_id]);
      console.log('Alumni details updated successfully');
      res.status(200).json({ message: 'Alumni details updated successfully!' });
    } else {
      // Insert if new
      const query = 'INSERT INTO alumni (alumni_id, email, fname, lastname, graduation_year, industry) VALUES (?, ?, ?, ?, ?, ?)';
      await db.execute(query, [alumni_id, email, fname, lastname, graduation_year, industry]);
      console.log('Alumni details added successfully');
      res.status(201).json({ message: 'Alumni details added successfully!' });
    }

    await db.end(); // Close the database connection
  } catch (error) {
    console.error('Error saving alumni details:', error); // Log full error object for more detail
    res.status(500).json({ message: 'Error saving alumni details' });
  }
});


// Route to fetch student details by ID number
app.get('/students/:idnumber', async (req, res) => {
  const { idnumber } = req.params;

  try {
    const db = await mysql.createConnection(dbConfig);

    // Check if the student exists in the students table
    const [rows] = await db.execute('SELECT * FROM students WHERE student_id = ?', [idnumber]);

    if (rows.length > 0) {
      // If the student exists, return their details
      res.status(200).json({
        exists: true,
        student: {
          student_id: rows[0].student_id,
          fname: rows[0].fname,
          lastname: rows[0].lastname,
          branch: rows[0].branch,
        },
      });
    } else {
      // If no student is found, return that the student doesn't exist
      res.status(200).json({ exists: false, student: null });
    }

    await db.end(); // Close the database connection
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ message: 'Error fetching student details' });
  }
});


// Route to fetch alumni details by ID number
app.get('/alumni/:idnumber', async (req, res) => {
  const { idnumber } = req.params;

  try {
    const db = await mysql.createConnection(dbConfig);

    // Check if the alumni exists in the alumni table
    const [rows] = await db.execute('SELECT * FROM alumni WHERE alumni_id = ?', [idnumber]);

    if (rows.length > 0) {
      // If the alumni exists, return their details
      res.status(200).json({
        exists: true,
        alumni: {
          alumni_id: rows[0].alumni_id,
          fname: rows[0].fname,
          lastname: rows[0].lastname,
          graduation_year: rows[0].graduation_year,
          industry: rows[0].industry,
        },
      });
    } else {
      // If no alumni is found, return that the alumni doesn't exist
      res.status(200).json({ exists: false, alumni: null });
    }

    await db.end(); // Close the database connection
  } catch (error) {
    console.error('Error fetching alumni details:', error);
    res.status(500).json({ message: 'Error fetching alumni details' });
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

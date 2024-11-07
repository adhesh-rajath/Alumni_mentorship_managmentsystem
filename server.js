import express from 'express';
import mysql from 'mysql2/promise'; // Promise-based MySQL client
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs'; // For hashing passwords

import { v4 as uuidv4 } from 'uuid';
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
  password: 'BeqFUzW8',
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
// Sign-Up Route
app.post('/signup', async (req, res) => {
  const { email, password, idnumber, role } = req.body;

  // Validate role-based ID number
  if (!validateIdNumber(role, idnumber)) {
    return res.status(400).json({ message: 'Invalid ID number for the specified role' });
  }

  try {
    // Connect to the database
    const db = await mysql.createConnection(dbConfig);

    // Check if ID number already exists
    const [existingUser] = await db.execute('SELECT * FROM loginuser WHERE idnumber = ?', [idnumber]);

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'ID number already exists' });
    }

    // Hash password for security
    //const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the loginuser table
    const query = 'INSERT INTO loginuser (email, password, idnumber, role) VALUES (?, ?, ?, ?)';
    await db.execute(query, [email, password, idnumber, role]);

    // Default values
    const defaultBio = 'No bio available';
    const defaultLink = 'No link available';

    // Insert into profile_students or profile_alumni based on role
    if (role === 'Student') {
      const studentProfileId = `${idnumber}prof`;
      await db.execute('INSERT INTO profile_students (id, profile_id, bio) VALUES (?, ?, ?)', [idnumber, studentProfileId, defaultBio]);
    } else if (role === 'Alumni') {
      const alumniProfileId = `${idnumber}prof`;
      await db.execute('INSERT INTO profile_alumni (id, profile_id, bio, githublink) VALUES (?, ?, ?, ?)', [idnumber, alumniProfileId, defaultBio, defaultLink]);
    }

    res.status(201).json({ message: 'User registered successfully!' });
    await db.end();
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

// Fetch bio from profile_students by student ID
app.get('/api/profile/students/:idnumber', async (req, res) => {
  const { idnumber } = req.params;

  try {
    const db = await mysql.createConnection(dbConfig);
    const [rows] = await db.execute('SELECT bio FROM profile_students WHERE id = ?', [idnumber]);

    if (rows.length > 0) {
      res.status(200).json({ bio: rows[0].bio });
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }

    await db.end();
  } catch (error) {
    console.error('Error fetching bio:', error);
    res.status(500).json({ message: 'Error fetching bio' });
  }
});


// Update bio in profile_students table
app.put('/api/profile/students', async (req, res) => {
  const { id, bio } = req.body;

  try {
    const db = await mysql.createConnection(dbConfig);

    const [result] = await db.execute(
      'UPDATE profile_students SET bio = ? WHERE id = ?',
      [bio, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Bio updated successfully' });
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }

    await db.end();
  } catch (error) {
    console.error('Error updating bio:', error);
    res.status(500).json({ message: 'Error updating bio' });
  }
});


// Get skills for a specific student by ID
app.get('/students/:idnumber/skills', async (req, res) => {
  const { idnumber } = req.params;

  try {
    const db = await mysql.createConnection(dbConfig);
    const [skills] = await db.execute('SELECT skill FROM students_skills WHERE id = ?', [idnumber]);

    res.status(200).json(skills.map(row => ({ skill: row.skill }))); // Format as array of objects
    await db.end();
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ message: 'Error fetching skills' });
  }
});


// Add a new skill for a specific student
app.post('/students/:idnumber/skills', async (req, res) => {
  const { idnumber } = req.params;
  const { skill } = req.body;

  try {
    const db = await mysql.createConnection(dbConfig);
    await db.execute('INSERT INTO students_skills (id, skill) VALUES (?, ?)', [idnumber, skill]);

    res.status(201).json({ message: 'Skill added successfully' });
    await db.end();
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ message: 'Error adding skill' });
  }
});


// Delete a specific skill for a student by ID
app.delete('/students/:idnumber/skills', async (req, res) => {
  const { idnumber } = req.params;
  const { skill } = req.body;

  try {
    const db = await mysql.createConnection(dbConfig);
    const result = await db.execute('DELETE FROM students_skills WHERE id = ? AND skill = ?', [idnumber, skill]);

    if (result[0].affectedRows > 0) {
      res.status(200).json({ message: 'Skill deleted' });
    } else {
      res.status(404).json({ message: 'Skill not found' });
    }
    await db.end();
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ message: 'Error deleting skill' });
  }
});



// Fetch expertise for a specific alumnus
app.get('/alumni/:idnumber/expertise', async (req, res) => {
  const { idnumber } = req.params;

  try {
    const db = await mysql.createConnection(dbConfig);
    const [rows] = await db.execute('SELECT expertise FROM alumni_expertise WHERE id = ?', [idnumber]);
    const expertiseList = rows.map(row => row.expertise);
    res.status(200).json(expertiseList);
    await db.end();
  } catch (error) {
    console.error('Error fetching expertise:', error);
    res.status(500).json({ message: 'Error fetching expertise' });
  }
});


// Add a new area of expertise for an alumnus
app.post('/alumni/:idnumber/expertise', async (req, res) => {
  const { idnumber } = req.params;
  const { expertise } = req.body;

  try {
    const db = await mysql.createConnection(dbConfig);
    await db.execute('INSERT INTO alumni_expertise (id, expertise) VALUES (?, ?)', [idnumber, expertise]);
    res.status(201).json({ message: 'Expertise added' });
    await db.end();
  } catch (error) {
    console.error('Error adding expertise:', error);
    res.status(500).json({ message: 'Error adding expertise' });
  }
});

// Delete a specific expertise for an alumnus by ID
app.delete('/alumni/:idnumber/expertise', async (req, res) => {
  const { idnumber } = req.params;
  const { expertise } = req.body;

  try {
    const db = await mysql.createConnection(dbConfig);
    const result = await db.execute('DELETE FROM alumni_expertise WHERE id = ? AND expertise = ?', [idnumber, expertise]);

    if (result[0].affectedRows > 0) {
      res.status(200).json({ message: 'Expertise deleted' });
    } else {
      res.status(404).json({ message: 'Expertise not found' });
    }
    await db.end();
  } catch (error) {
    console.error('Error deleting expertise:', error);
    res.status(500).json({ message: 'Error deleting expertise' });
  }
});



app.get('/api/profile/alumni/:idnumber', async (req, res) => {
  const { idnumber } = req.params;

  try {
    const db = await mysql.createConnection(dbConfig);
    const [rows] = await db.execute('SELECT bio, githublink FROM profile_alumni WHERE id = ?', [idnumber]);

    if (rows.length > 0) {
      res.status(200).json({ bio: rows[0].bio, githublink: rows[0].githublink });
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }

    await db.end();
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update alumni profile (PUT request)
app.put('/api/profile/alumni', async (req, res) => {
  const { id, bio, githublink } = req.body;

  try {
    const db = await mysql.createConnection(dbConfig);

    const [result] = await db.execute(
      'UPDATE profile_alumni SET bio = ?, githublink = ? WHERE id = ?',
      [bio, githublink, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Profile updated successfully' });
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }

    await db.end();
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});



// API endpoint to get all alumni with their expertise
// API endpoint to get all alumni with their expertise
app.get('/api/alumni', async (req, res) => {
  const query = `
    SELECT 
      a.alumni_id, 
      a.fname, 
      a.lastname, 
      a.graduation_year, 
      a.industry, 
      p.bio, 
      p.githublink,
      GROUP_CONCAT(e.expertise) AS expertise
    FROM alumni a
    LEFT JOIN profile_alumni p ON a.alumni_id = p.id
    LEFT JOIN alumni_expertise e ON a.alumni_id = e.id
    GROUP BY a.alumni_id;
  `;

  try {
    const db = await mysql.createConnection(dbConfig);
    const [results] = await db.execute(query);

    // Format results to include expertise as an array
    const formattedResults = results.map(row => ({
      alumni_id: row.alumni_id,
      fname: row.fname,
      lastname: row.lastname,
      graduation_year: row.graduation_year,
      industry: row.industry,
      bio: row.bio,
      githublink: row.githublink,
      expertise: row.expertise ? row.expertise.split(',') : [], // Convert to array
    }));

    res.json(formattedResults);
    await db.end(); // Close the database connection
  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/requestMentorship', async (req, res) => {
  const { alumni_id, student_id, branch, topic } = req.body;
  const request_id = uuidv4(); // Generate a unique ID for the request

  // Check if any of the required fields are missing
  if (!alumni_id || !student_id || !branch || !topic) {
    return res.status(400).json({ error: 'Missing required fields: alumni_id, student_id, branch, topic' });
  }

  try {
    // Create a connection to the database
    const db = await mysql.createConnection(dbConfig);
    
    // Check for existing requests with the same alumni_id and student_id
    const [existingRequests] = await db.execute(
      `SELECT COUNT(*) as count FROM mentor_requests WHERE alumni_id = ? AND student_id = ?`,
      [alumni_id, student_id]
    );

    if (existingRequests[0].count >= 2) {
      // Close the database connection
      await db.end();
      return res.status(400).json({ error: 'Max limit of mentorship requests exceeded' });
    }

    // Insert the new request into the mentor_requests table
    const query = `
      INSERT INTO mentor_requests (request_id, alumni_id, student_id, branch, topic)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.execute(query, [request_id, alumni_id, student_id, branch, topic]);

    // Close the database connection
    await db.end();

    // Send a success response
    res.status(201).json({ message: 'Mentorship request sent successfully', request_id });
  } catch (error) {
    console.error('Error inserting mentorship request:', error);
    res.status(500).json({ error: 'Failed to send mentorship request' });
  }
});

// server.js
app.get('/api/studentman/:student_id', async (req, res) => {
  const student_id = req.params.student_id;
  
  try {
    // Create a connection to the database
    const db = await mysql.createConnection(dbConfig);
    
    // Execute the query
    const [student] = await db.execute('SELECT branch FROM students WHERE student_id = ?', [student_id]);

    // Close the connection
    await db.end();

    if (student.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student[0]);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/mentor-requests/:alumniId', async (req, res) => {
  const alumniId = req.params.alumniId;
  const sql = `SELECT * FROM mentor_requests WHERE alumni_id = ?`;

  try {
    // Create a connection
    const db = await mysql.createConnection(dbConfig);

    // Execute the query
    const [results] = await db.execute(sql, [alumniId]);

    // Send results as JSON
    res.json(results);

    // Close the connection
    await db.end();
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).send('Server error');
  }
});



app.post('/api/session-mentoring', async (req, res) => {
  const { alumni_id, student_id, request_id, linktosession, date, duration } = req.body;

  const sessionDate = date || new Date().toISOString().split("T")[0];
  const sessionDuration = duration || 60;

  try {
    const db = await mysql.createConnection(dbConfig);

    // Add session to `session_mentoring` table
    const query = `
      INSERT INTO session_mentoring (alumni_id, student_id, request_id, linktosession, date, duration)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [alumni_id, student_id, request_id, linktosession, sessionDate, sessionDuration]);

    // Update request status to "Accepted" in `mentor_requests` table
    await db.execute(
      `UPDATE mentor_requests SET status = 'Accepted' WHERE request_id = ?`,
      [request_id]
    );

    await db.end();

    res.status(201).json({
      message: "Session added successfully",
      sessionId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding session:", error);
    res.status(500).json({ error: "Failed to add session" });
  }
});

app.get('/api/student-sessions/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    const db = await mysql.createConnection(dbConfig);

    // Query to fetch sessions for the specific student
    const query = `
      SELECT id, date, duration, linktosession
      FROM session_mentoring
      WHERE student_id = ? AND date >= CURDATE()  -- Only fetch upcoming sessions
    `;
    const [sessions] = await db.execute(query, [studentId]);

    await db.end();

    if (sessions.length > 0) {
      res.status(200).json(sessions);
    } else {
      res.status(404).json({ message: "No upcoming sessions found" });
    }
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

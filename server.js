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



// Fetch bio from profile_students table
// app.get('/api/profile/students/:idnumber', async (req, res) => {
//   console.log('Fetching bio for student ID:', req.params.id); // Debug log
//   const { idnumber } = req.params;
//   try {
//     const db = await mysql.createConnection(dbConfig);

//     const [rows] = await db.execute(
//       'SELECT bio FROM profile_students WHERE id = ?',
//       [idnumber]
//     );

//     if (rows.length > 0) {
//       res.status(200).json({ bio: rows[0].bio });
//     } else {
//       res.status(404).json({ message: 'Profile not found' });
//     }

//     await db.end();
//   } catch (error) {
//     console.error('Error fetching bio:', error);
//     res.status(500).json({ message: 'Error fetching bio' });
//   }
// });

// // Update bio in profile_students table
// app.put('/api/profile/students', async (req, res) => {
//   const { id, bio } = req.body;
//   console.log('Updating bio for student ID:', id); // Debug log
//   try {
//     const db = await mysql.createConnection(dbConfig);

//     const [result] = await db.execute(
//       'UPDATE profile_students SET bio = ? WHERE id = ?',
//       [bio, id]
//     );

//     if (result.affectedRows > 0) {
//       res.status(200).json({ message: 'Bio updated successfully' });
//     } else {
//       res.status(404).json({ message: 'Profile not found' });
//     }

//     await db.end();
//   } catch (error) {
//     console.error('Error updating bio:', error);
//     res.status(500).json({ message: 'Error updating bio' });
//   }
// });
// //

// Route to fetch bio from profile_students by student ID
// Route to get the bio of a student based on their ID number
// app.get('/api/profile/students/:idnumber', (req, res) => {
//   const { idnumber } = req.params;

//   const query = 'SELECT bio FROM profile_students WHERE id = ?';
  
//   db.query(query, [idnumber], (err, results) => {
//     if (err) {
//       console.error('Database query error:', err);  // Logs specific error in server console
//       return res.status(500).json({ error: 'Database query error', details: err.message });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     res.json({ bio: results[0].bio });
//   });
// });


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



// Get skills for a specific student by id
// app.get('/api/profile/students/:id/skills', async (req, res) => {
//   const studentId = req.params.id;
//   console.log('Attempting to add skills for profile_id:', studentId);

//   try {
//     const db = await mysql.createConnection(dbConfig);

//     const [skills] = await db.execute(
//       'SELECT skill FROM students_skills WHERE id = ?',
//       [studentId]
//     );

//     res.status(200).json({ skills: skills.map(row => row.skill) });

//     await db.end();
//   } catch (error) {
//     console.error('Error fetching skills:', error);
//     res.status(500).json({ message: 'Error fetching skills' });
//   }
// });



// // Add skills for a specific student by id
// app.post('/api/profile/students/:id/skills', async (req, res) => {
//   const studentId = req.params.id;
//   const { skills } = req.body; // Array of skills

//   try {
//     const db = await mysql.createConnection(dbConfig);

//     // Insert each skill individually
//     const insertPromises = skills.map(skill =>
//       db.execute('INSERT INTO students_skills (id, skill) VALUES (?, ?)', [studentId, skill])
//     );

//     await Promise.all(insertPromises);

//     res.status(200).json({ message: 'Skills added successfully' });

//     await db.end();
//   } catch (error) {
//     console.error('Error adding skills:', error);
//     res.status(500).json({ message: 'Error adding skills' });
//   }
// });


// // Delete a skill for a specific student by id
// app.delete('/api/profile/students/:id/skills', async (req, res) => {
//   const studentId = req.params.id;
//   const { skill } = req.body;

//   try {
//     const db = await mysql.createConnection(dbConfig);

//     const [result] = await db.execute(
//       'DELETE FROM students_skills WHERE id = ? AND skill = ?',
//       [studentId, skill]
//     );

//     if (result.affectedRows > 0) {
//       res.status(200).json({ message: 'Skill deleted successfully' });
//     } else {
//       res.status(404).json({ message: 'Skill not found' });
//     }

//     await db.end();
//   } catch (error) {
//     console.error('Error deleting skill:', error);
//     res.status(500).json({ message: 'Error deleting skill' });
//   }
// });

// Get skills for a specific student by ID
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const [role, setRole] = useState('Student');
  const [idnumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    
    // Reset ID number when the role changes
    setIdNumber('');
    setError(''); // Clear any previous error messages
  };

  const validateIdNumber = (role, idnumber) => {
    if (role === 'Alumni' && !idnumber.startsWith('ALU')) return 'ID number must start with "ALU"';
    if (role === 'Admin' && !idnumber.startsWith('ADM')) return 'ID number must start with "ADM"';
    if (role === 'Student' && !idnumber.startsWith('PES1UG')) return 'ID number must start with "PES1UG"';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate ID number based on selected role
    const idNumberError = validateIdNumber(role, idnumber);
    if (idNumberError) {
      setError(idNumberError);
      return;
    }

    const response = await fetch('http://localhost:5000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
        idnumber,
        email,
        password,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('User signed up successfully');
      navigate('/login');
    } else {
      alert(data.message);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="role">Role:</label>
          <select id="role" value={role} onChange={handleRoleChange} required>
            <option value="Student">Student</option>
            <option value="Alumni">Alumni</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div>
          <label htmlFor="idnumber">ID Number:</label>
          <input
            type="text"
            id="idnumber"
            value={idnumber}
            onChange={(e) => setIdNumber(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;

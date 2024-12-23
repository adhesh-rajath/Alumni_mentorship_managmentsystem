// Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './login.css';

function Login({ setUser }) {
  const [idnumber, setIdNumber] = useState('');
  const [role, setRole] = useState('Student');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:5000/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idnumber,
        role,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setUser({ idnumber, role, email: data.user.email });
      navigate(`/`);
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="login">
      <div className="login-box">
        <h2>Welcome back</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
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
          <div>
            <label htmlFor="role">Role:</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="Student">Student</option>
              <option value="Alumni">Alumni</option>
              <option value="Admin">Admin</option>
            </select>
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
          <button type="submit">Sign In</button>
        </form>
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

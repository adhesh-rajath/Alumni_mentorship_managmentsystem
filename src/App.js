// App.js
import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './Home';
import About from './About';
import Login from './Login';
import SignUp from './SignUp';
import StudentDashboard from './StudentDashboard';
import AlumniDashboard from './AlumniDashboard';
import AdminDashboard from './AdminDashboard';
import logo from './logoPesu.png';
import './navbar.css';

function App() {
  const [user, setUser] = useState(null); // Stores user data on login
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="App">
      <header className="App-header">
        <nav className="navbar">
          <div className="nav-left">
            <Link to="/">
              <img src={logo} alt="Logo" className="logo" />
            </Link>
          </div>
          <div className="nav-right">
            {user ? (
              <>
                <span>Welcome, {user.idnumber}</span>
                <Link to="/about">About</Link>
                <Link to={`/${user.role.toLowerCase()}dashboard`}>Dashboard</Link>
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Sign In</Link>
                <Link to="/signup">Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <Routes>
        <Route
          path="/"
          element={user ? <Home /> : <Login setUser={setUser} />}
        />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/studentdashboard" element={<StudentDashboard user={user} />} />
        <Route path="/alumnidashboard" element={<AlumniDashboard />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;

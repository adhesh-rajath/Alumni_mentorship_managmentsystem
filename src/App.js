import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './Home';
import About from './About';
import Login from './Login';
import SignUp from './SignUp';
import Dashboard from './Dashboard';
import logo from './logoPesu.png';
import './navbar.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
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
            {isLoggedIn ? (
              <>
                <Link to="/about">About</Link>
                <Link to="/dashboard">Dashboard</Link>
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
          element={isLoggedIn ? <Home /> : <Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/about" element={<About />} />
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;

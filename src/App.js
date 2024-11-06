import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './Home';
import About from './About';
import Login from './Login';
import SignUp from './SignUp';
import StudentDashboard from './StudentDashboard';
import AlumniDashboard from './AlumniDashboard';
import AdminDashboard from './AdminDashboard';
import StudentProfile from './StudentProfile';
import AlumniProfile from './AlumniProfile';
import StudentSkill from './StudentSkill';
import AlumniExpertise from './AlumniExpertise';
import FindMentors from './FindMentors'; // New FindMentors component
import ViewRequests from './ViewRequests'; // New ViewRequests component
import logo from './logoPesu.png';
import './navbar.css';
import StudentSessions from './StudentSessions';
function App() {
  const [user, setUser] = useState(null);
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
                <Link to={`/${user.role.toLowerCase() === 'student' ? 'profile_student' : 'profile_alumni'}`}>Profile</Link>
                {user.role.toLowerCase() === 'student' && <Link to="/studentskill">Student Skill</Link>}
                {user.role.toLowerCase() === 'alumni' && <Link to="/alumniexpertise">Alumni Expertise</Link>}
                
                {/* New Links based on role */}
                {user.role.toLowerCase() === 'student' && <Link to="/findmentors">Find Mentors</Link>}
                {user.role.toLowerCase() === 'alumni' && <Link to="/viewrequests">View Requests</Link>}
                
                {user.role.toLowerCase() === 'student' && <Link to="/studentsessions">Student Sessions</Link>}


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
        <Route path="/" element={user ? <Home /> : <Login setUser={setUser} />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/studentdashboard" element={<StudentDashboard user={user} />} />
        <Route path="/alumnidashboard" element={<AlumniDashboard user={user} />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile_student" element={<StudentProfile user={user} />} />
        <Route path="/profile_alumni" element={<AlumniProfile user={user} />} />
        <Route path="/studentskill" element={<StudentSkill user={user} />} />
        <Route path="/alumniexpertise" element={<AlumniExpertise user={user} />} />

        {/* New Routes */}
        <Route path="/studentsessions" element={<StudentSessions user={user} />} />
        <Route path="/findmentors" element={<FindMentors user={user} />} />
        <Route path="/viewrequests" element={<ViewRequests user={user} />} />
      </Routes>
    </div>
  );
}

export default App;

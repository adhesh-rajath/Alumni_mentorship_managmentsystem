import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [mentorRequests, setMentorRequests] = useState([]);
  const [studentProfiles, setStudentProfiles] = useState([]);
  const [alumniProfiles, setAlumniProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch mentor requests
        const mentorResponse = await fetch('http://localhost:5000/api/mentors-requests');
        const mentorsData = await mentorResponse.json();
        setMentorRequests(mentorsData);

        // Fetch student profiles
        const studentResponse = await fetch('http://localhost:5000/api/profile/students');
        const studentsData = await studentResponse.json();
        setStudentProfiles(studentsData);

        // Fetch alumni profiles
        const alumniResponse = await fetch('http://localhost:5000/api/profile/alumni');
        const alumniData = await alumniResponse.json();
        setAlumniProfiles(alumniData);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-dashboard">
      <h2>Welcome to the Admin Dashboard</h2>

      <section>
        <h3>Mentor Requests</h3>
        {mentorRequests.length > 0 ? (
          <ul>
            {mentorRequests.map((request) => (
              <li key={request.id}>
                <p><strong>Name:</strong> {request.name}</p>
                <p><strong>Email:</strong> {request.email}</p>
                <p><strong>Field:</strong> {request.field}</p>
                <p><strong>Request Date:</strong> {request.request_date}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No mentor requests available.</p>
        )}
      </section>

      <section>
        <h3>Student Profiles</h3>
        {studentProfiles.length > 0 ? (
          <ul>
            {studentProfiles.map((student) => (
              <li key={student.id}>
                <p><strong>ID:</strong> {student.idnumber}</p>
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Major:</strong> {student.major}</p>
                <p><strong>Year:</strong> {student.year}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No student profiles available.</p>
        )}
      </section>

      <section>
        <h3>Alumni Profiles</h3>
        {alumniProfiles.length > 0 ? (
          <ul>
            {alumniProfiles.map((alumni) => (
              <li key={alumni.id}>
                <p><strong>ID:</strong> {alumni.idnumber}</p>
                <p><strong>Name:</strong> {alumni.name}</p>
                <p><strong>Graduation Year:</strong> {alumni.graduation_year}</p>
                <p><strong>Industry:</strong> {alumni.industry}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No alumni profiles available.</p>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;

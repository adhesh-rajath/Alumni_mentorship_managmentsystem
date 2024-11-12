import React, { useEffect, useState } from 'react';
import './findMentors.css';

function FindMentors({ user }) {
  const [alumni, setAlumni] = useState([]);
  const [studentBranch, setStudentBranch] = useState('');

  useEffect(() => {
    // Fetch student branch from the server
    const fetchStudentBranch = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/studentman/${user.idnumber}`);
        if (!response.ok) {
          throw new Error('Failed to fetch student branch');
        }
        const data = await response.json();
        setStudentBranch(data.branch);
      } catch (error) {
        console.error('Error fetching student branch:', error);
      }
    };

    // Fetch alumni data from the server
    const fetchAlumni = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/alumni');
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();

        const formattedAlumni = data.map(row => ({
          id: row.alumni_id,
          name: `${row.fname} ${row.lastname}`,
          graduation_year: row.graduation_year,
          industry: row.industry,
          bio: row.bio,
          githublink: row.githublink,
          expertise: row.expertise || [],
        }));

        setAlumni(formattedAlumni);
      } catch (error) {
        console.error('Error fetching alumni data:', error);
      }
    };

    fetchStudentBranch();
    fetchAlumni();
  }, [user.idnumber]);

  const handleRequestMentorship = async (alumni_id, industry) => {
    if (studentBranch !== industry) {
      return alert('Your branch does not match the industry of this mentor.');
    }

    try {
      const response = await fetch('http://localhost:5000/api/requestMentorship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumni_id,
          student_id: user.idnumber,
          branch: studentBranch,
          topic: industry
        })
      });
      const result = await response.json();
      if (response.ok) {
        alert('Mentorship request sent successfully!');
      } else {
        alert('Error sending request: ' + result.error);
      }
    } catch (error) {
      console.error('Error requesting mentorship:', error);
    }
  };

  return (
    <div>
      <h2>Find Mentors</h2>
      <div className="alumni-list">
        {alumni.map((alum) => (
          <div key={alum.id} className="alumni-card">
            <h3>{alum.name}</h3>
            <p><strong>ID:</strong> {alum.id}</p>
            <p><strong>Graduation Year:</strong> {alum.graduation_year}</p>
            <p><strong>Industry:</strong> {alum.industry}</p>
            <p><strong>Bio:</strong> {alum.bio}</p>
            <p><strong>GitHub:</strong> <a href={alum.githublink} target="_blank" rel="noopener noreferrer">{alum.githublink || 'No link available'}</a></p>
            <p><strong>Expertise:</strong> {alum.expertise.join(', ') || 'No expertise available'}</p>
            <button onClick={() => handleRequestMentorship(alum.id, alum.industry)}>Request Mentorship</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FindMentors;

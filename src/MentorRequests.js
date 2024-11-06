import React, { useEffect, useState } from 'react';

function MentorRequests() {
  const [requests, setRequests] = useState([]);

  // Assuming you have a way to get the current logged-in student's ID
  const studentId = 'PES1UG123'; // Replace with actual student ID

  useEffect(() => {
    // Fetch mentorship requests from the server
    const fetchRequests = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/mentor-requests?student_id=${studentId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching mentorship requests:', error);
      }
    };

    fetchRequests();
  }, [studentId]);

  return (
    <div>
      <h2>My Mentorship Requests</h2>
      {requests.length === 0 ? (
        <p>No mentorship requests found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Alumni ID</th>
              <th>Topic</th>
              <th>Branch</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.request_id}>
                <td>{req.request_id}</td>
                <td>{req.alumni_id}</td>
                <td>{req.topic}</td>
                <td>{req.branch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MentorRequests;

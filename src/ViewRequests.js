import React, { useEffect, useState } from 'react';

function ViewRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [sessionDetails, setSessionDetails] = useState({
    date: "",
    time: "",
    duration: 60 // default to 60 minutes
  });

  const alumniId = user.idnumber;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`/api/mentor-requests/${alumniId}`);
        if (!response.ok) throw new Error("Failed to fetch requests");
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching mentorship requests:", error);
      }
    };

    fetchRequests();
  }, [alumniId]);

  const handleAccept = async (requestId, studentId) => {
    const { date, time, duration } = sessionDetails;
    const sessionDateTime = date && time ? `${date} ${time}` : null;

    try {
      const response = await fetch('/api/session-mentoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumni_id: alumniId,
          student_id: studentId,
          request_id: requestId,
          linktosession: "https://defaultsessionlink.com",
          date: sessionDateTime || new Date().toISOString().split("T")[0], // Default to today
          duration: duration || 60 // Default to 60 minutes if not set
        })
      });

      if (!response.ok) throw new Error("Failed to add session");

      console.log("Session added successfully for request:", requestId);
      
      // Update status in the state
      setRequests(prevRequests =>
        prevRequests.map(req => req.request_id === requestId ? { ...req, status: 'Accepted' } : req)
      );
      
    } catch (error) {
      console.error("Error adding session:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSessionDetails(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2>View Requests</h2>
      {requests.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Student ID</th>
              <th>Branch</th>
              <th>Topic</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration (min)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.request_id}>
                <td>{request.request_id}</td>
                <td>{request.student_id}</td>
                <td>{request.branch}</td>
                <td>{request.topic}</td>
                <td><input type="date" name="date" onChange={handleInputChange} /></td>
                <td><input type="time" name="time" onChange={handleInputChange} /></td>
                <td><input type="number" name="duration" placeholder="60" onChange={handleInputChange} /></td>
                <td>{request.status === 'Accepted' ? 'Accepted' : 'Pending'}</td>
                <td>
                  {request.status !== 'Accepted' ? (
                    <button onClick={() => handleAccept(request.request_id, request.student_id)}>Accept</button>
                  ) : (
                    <span>Accepted</span>
                  )}
                  <button onClick={() => console.log("Reject request:", request.request_id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No requests found.</p>
      )}
    </div>
  );
}

export default ViewRequests;

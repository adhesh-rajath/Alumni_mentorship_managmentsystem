import React, { useEffect, useState } from 'react';

function ViewRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [sessionDetails, setSessionDetails] = useState({});

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
    const details = sessionDetails[requestId] || {};
    const { date, time, duration } = details;
    const sessionDateTime = date && time ? `${date} ${time}` : new Date().toISOString().split("T")[0];

    try {
      const response = await fetch('/api/session-mentoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumni_id: alumniId,
          student_id: studentId,
          request_id: requestId,
          linktosession: "https://defaultsessionlink.com",
          date: sessionDateTime,
          duration: duration || 60,
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

  const handleReject = (requestId) => {
    if (window.confirm("Are you sure you want to reject this request?")) {
      setRequests(prevRequests => prevRequests.filter(req => req.request_id !== requestId));
      console.log("Request rejected:", requestId);
    }
  };

  const handleInputChange = (e, requestId) => {
    const { name, value } = e.target;
    setSessionDetails(prevDetails => ({
      ...prevDetails,
      [requestId]: { ...prevDetails[requestId], [name]: value }
    }));
  };

  const pendingRequests = requests.filter(request => request.status !== 'Accepted');
  const acceptedRequests = requests.filter(request => request.status === 'Accepted');

  return (
    <div>
      <h2>Mentorship Requests</h2>

      <h3>Pending Requests</h3>
      {pendingRequests.length > 0 ? (
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
            {pendingRequests.map((request) => (
              <tr key={request.request_id}>
                <td>{String(request.request_id).slice(-7)}</td>
                <td>{request.student_id}</td>
                <td>{request.branch}</td>
                <td>{request.topic}</td>
                <td>
                  <input
                    type="date"
                    name="date"
                    onChange={(e) => handleInputChange(e, request.request_id)}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    name="time"
                    onChange={(e) => handleInputChange(e, request.request_id)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="duration"
                    placeholder="60"
                    onChange={(e) => handleInputChange(e, request.request_id)}
                  />
                </td>
                <td>Pending</td>
                <td>
                  <button onClick={() => handleAccept(request.request_id, request.student_id)}>
                    Accept
                  </button>
                  <button onClick={() => handleReject(request.request_id)}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No pending requests.</p>
      )}

      <h3>Accepted Requests</h3>
      {acceptedRequests.length > 0 ? (
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
            </tr>
          </thead>
          <tbody>
            {acceptedRequests.map((request) => (
              <tr key={request.request_id}>
                <td>{String(request.request_id).slice(-7)}</td>
                <td>{request.student_id}</td>
                <td>{request.branch}</td>
                <td>{request.topic}</td>
                <td>{sessionDetails[request.request_id]?.date || 'N/A'}</td>
                <td>{sessionDetails[request.request_id]?.time || 'N/A'}</td>
                <td>{sessionDetails[request.request_id]?.duration || 60}</td>
                <td>Accepted</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No accepted requests.</p>
      )}
    </div>
  );
}

export default ViewRequests;

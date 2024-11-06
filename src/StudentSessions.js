import React, { useEffect, useState } from 'react';

function StudentSessions({ user }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`/api/student-sessions/${user.idnumber}`);
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setSessions([]);
      }
    };

    fetchSessions();
  }, [user.idnumber]);

  return (
    <div>
      <h2>Your Upcoming Sessions</h2>
      {sessions.length > 0 ? (
        <ul>
          {sessions.map((session) => (
            <li key={session.session_id}>
              <strong>Session ID:</strong> {session.session_id} <br />
              <strong>Date:</strong> {session.date} <br />
              <strong>Time:</strong> {session.time} <br />
              <strong>Duration:</strong> {session.duration} minutes <br />
              <strong>Session Link:</strong> <a href={session.linktosession} target="_blank" rel="noopener noreferrer">Join</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming sessions found.</p>
      )}
    </div>
  );
}

export default StudentSessions;

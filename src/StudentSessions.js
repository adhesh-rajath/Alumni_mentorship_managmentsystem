import React, { useEffect, useState } from 'react';

function StudentSessions({ user }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`/api/student-sessions/${user.idnumber}`);
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        
        // Format the date and time for each session
        const formattedSessions = data.map(session => ({
          ...session,
          date: formatDate(session.date), // Extract date
          time: formatTime(session.date)  // Extract time
        }));
        
        setSessions(formattedSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setSessions([]);
      }
    };

    fetchSessions();
  }, [user.idnumber]);

  // Function to format the date
  const formatDate = (timestamp) => {
    return timestamp.split("T")[0]; // Extracts the 'YYYY-MM-DD' part
  };

  // Function to format the time
  const formatTime = (timestamp) => {
    return timestamp.split("T")[1].split(".")[0]; // Extracts the 'HH:MM:SS' part
  };

  return (
    <div>
      <h2>Your Upcoming Sessions</h2>
      {sessions.length > 0 ? (
        <div style={styles.sessionContainer}>
          {sessions.map((session) => (
            <div key={session.session_id} style={styles.sessionBox}>
              <div style={styles.date}>{session.date}</div>
              <div style={styles.time}>Time: {session.time}</div>
              <div style={styles.duration}>Duration: {session.duration} minutes</div>
              <a href={session.linktosession} target="_blank" rel="noopener noreferrer" style={styles.link}>
                Join Session
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p>No upcoming sessions found.</p>
      )}
    </div>
  );
}

const styles = {
  sessionContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '20px',
  },
  sessionBox: {
    backgroundColor: '#f0f4f8',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '16px',
    width: '200px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  date: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  time: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '4px',
  },
  duration: {
    fontSize: '14px',
    color: '#777',
    marginBottom: '12px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
    marginTop: '10px',
  },
};

export default StudentSessions;

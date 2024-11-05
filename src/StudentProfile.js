// StudentProfile.js
import React, { useState, useEffect } from 'react';

function StudentProfile({ user }) {
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updatedBio, setUpdatedBio] = useState('');
  const [message, setMessage] = useState('');

  // Fetch the bio on component mount
  useEffect(() => {
    const fetchBio = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/profile/students/${user.idnumber}`);
        const data = await response.json();
        if (response.ok) {
          setBio(data.bio);
          setUpdatedBio(data.bio); // Set updatedBio to current bio for editing
        } else {
          setMessage(data.message);
        }
      } catch (error) {
        console.error('Error fetching bio:', error);
        setMessage('Error fetching bio');
      }
    };

    fetchBio();
  }, [user.idnumber]);

  // Update the bio in the database
  const handleUpdateBio = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/profile/students`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: user.idnumber, bio: updatedBio }),
      });

      const data = await response.json();

      if (response.ok) {
        setBio(updatedBio); // Update the displayed bio
        setIsEditing(false); // Exit editing mode
        setMessage(data.message); // Success message
      } else {
        setMessage(data.message); // Error message
      }
    } catch (error) {
      console.error('Error updating bio:', error);
      setMessage('Error updating bio');
    }
  };

  return (
    <div>
      <h2>Student Profile</h2>
      <p>ID: {user.idnumber}</p>
      <p>Email: {user.email}</p>
      <div>
        <h3>Bio:</h3>
        {isEditing ? (
          <textarea
            value={updatedBio}
            onChange={(e) => setUpdatedBio(e.target.value)}
            rows="4"
            cols="50"
          />
        ) : (
          <p>{bio}</p>
        )}
        {isEditing ? (
          <button onClick={handleUpdateBio}>Save</button>
        ) : (
          <button onClick={() => setIsEditing(true)}>Edit Bio</button>
        )}
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}

export default StudentProfile;

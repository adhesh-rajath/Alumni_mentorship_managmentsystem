import React, { useState, useEffect } from 'react';
//import './alumniProfile.css';

function AlumniProfile({ user }) {
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [updatedBio, setUpdatedBio] = useState('');
  const [githubLink, setGithubLink] = useState('No link available');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [updatedLink, setUpdatedLink] = useState('');
  const [message, setMessage] = useState('');

  // Fetch the bio and GitHub link on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/profile/alumni/${user.idnumber}`);
        const data = await response.json();
        if (response.ok) {
          setBio(data.bio);
          setGithubLink(data.githublink || 'No link available');
          setUpdatedBio(data.bio);
          setUpdatedLink(data.githublink || '');
        } else {
          setMessage(data.message);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage('Error fetching profile');
      }
    };

    fetchProfile();
  }, [user.idnumber]);

  // Update the bio and/or GitHub link in the database
  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/profile/alumni`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: user.idnumber, bio: updatedBio, githublink: updatedLink }),
      });

      const data = await response.json();

      if (response.ok) {
        setBio(updatedBio);
        setGithubLink(updatedLink);
        setIsEditingBio(false);
        setIsEditingLink(false);
        setMessage(data.message);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
    }
  };

  return (
    <div>
      <h2>Alumni Profile</h2>
      <p>ID: {user.idnumber}</p>
      <p>Email: {user.email}</p>
      
      <div>
        <h3>GitHub Link:</h3>
        {isEditingLink ? (
          <input
            type="text"
            value={updatedLink}
            onChange={(e) => setUpdatedLink(e.target.value)}
          />
        ) : (
          <p>
            <a href={githubLink} target="_blank" rel="noopener noreferrer">{githubLink}</a>
          </p>
        )}
        {isEditingLink ? (
          <button onClick={handleUpdateProfile}>Save Link</button>
        ) : (
          <button onClick={() => setIsEditingLink(true)}>Edit Link</button>
        )}
      </div>

      <div>
        <h3>Bio:</h3>
        {isEditingBio ? (
          <textarea
            value={updatedBio}
            onChange={(e) => setUpdatedBio(e.target.value)}
            rows="4"
            cols="50"
          />
        ) : (
          <p>{bio}</p>
        )}
        {isEditingBio ? (
          <button onClick={handleUpdateProfile}>Save Bio</button>
        ) : (
          <button onClick={() => setIsEditingBio(true)}>Edit Bio</button>
        )}
      </div>
      
      {message && <p>{message}</p>}
    </div>
  );
}

export default AlumniProfile;

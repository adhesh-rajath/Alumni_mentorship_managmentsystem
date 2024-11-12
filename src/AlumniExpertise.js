import React, { useEffect, useState } from 'react';
import './AlumniExpertise.css';
function AlumniExpertise({ user }) {
  const [expertise, setExpertise] = useState([]);
  const [newExpertise, setNewExpertise] = useState('');
  const [error, setError] = useState('');

  // Fetch expertise when component mounts
  useEffect(() => {
    if (user) {
      fetchExpertise();
    }
  }, [user]);

  const fetchExpertise = async () => {
    try {
      const response = await fetch(`http://localhost:5000/alumni/${user.idnumber}/expertise`);
      const data = await response.json();
      const formattedExpertise = data.map(exp => (typeof exp === 'string' ? { expertise: exp } : exp));
      setExpertise(formattedExpertise);
    } catch (error) {
      console.error('Error fetching expertise:', error);
    }
  };

  const handleAddExpertise = async () => {
    if (newExpertise.trim() === '') {
      setError('Please enter an area of expertise');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/alumni/${user.idnumber}/expertise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expertise: newExpertise }),
      });

      if (response.ok) {
        setExpertise((prevExpertise) => [...prevExpertise, { expertise: newExpertise }]);
        setNewExpertise('');
        setError('');
      } else {
        setError('Error adding expertise');
      }
    } catch (error) {
      console.error('Error adding expertise:', error);
      setError('Error adding expertise');
    }
  };

  const handleDeleteExpertise = async (expertiseToDelete) => {
    try {
      const response = await fetch(`http://localhost:5000/alumni/${user.idnumber}/expertise`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expertise: expertiseToDelete }),
      });

      if (response.ok) {
        setExpertise((prevExpertise) => prevExpertise.filter(expObj => expObj.expertise !== expertiseToDelete));
      } else {
        console.error('Error deleting expertise');
      }
    } catch (error) {
      console.error('Error deleting expertise:', error);
    }
  };

  return (
    <div>
      <h2>Alumni Expertise</h2>
      <ul>
        {expertise.map((expObj, index) => (
          <li key={index}>
            {expObj.expertise}
            <button onClick={() => handleDeleteExpertise(expObj.expertise)}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          value={newExpertise}
          onChange={(e) => setNewExpertise(e.target.value)}
          placeholder="Add a new area of expertise"
        />
        <button onClick={handleAddExpertise}>Add Expertise</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
}

export default AlumniExpertise;

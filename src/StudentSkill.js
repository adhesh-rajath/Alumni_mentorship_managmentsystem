import React, { useEffect, useState } from 'react';

function StudentSkill({ user }) {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchSkills();
    }
  }, [user]);

  const fetchSkills = async () => {
    try {
      const response = await fetch(`http://localhost:5000/students/${user.idnumber}/skills`);
      const data = await response.json();
      const formattedSkills = data.map(skill => (typeof skill === 'string' ? { skill } : skill));
      setSkills(formattedSkills);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleAddSkill = async () => {
    if (newSkill.trim() === '') {
      setError('Please enter a skill');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/students/${user.idnumber}/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skill: newSkill }),
      });

      if (response.ok) {
        setSkills((prevSkills) => [...prevSkills, { skill: newSkill }]);
        setNewSkill('');
        setError('');
      } else {
        setError('Error adding skill');
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      setError('Error adding skill');
    }
  };

  const handleDeleteSkill = async (skillToDelete) => {
    try {
      const response = await fetch(`http://localhost:5000/students/${user.idnumber}/skills`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skill: skillToDelete }),
      });

      if (response.ok) {
        // Remove deleted skill from the state
        setSkills((prevSkills) => prevSkills.filter(skillObj => skillObj.skill !== skillToDelete));
      } else {
        console.error('Error deleting skill');
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  return (
    <div>
      <h2>Student Skills</h2>
      <ul>
        {skills.map((skillObj, index) => (
          <li key={index}>
            {skillObj.skill} 
            <button onClick={() => handleDeleteSkill(skillObj.skill)}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a new skill"
        />
        <button onClick={handleAddSkill}>Add Skill</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
}

export default StudentSkill;

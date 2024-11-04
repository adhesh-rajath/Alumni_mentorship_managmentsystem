import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    student_id: user.idnumber,
    fname: '',
    lastname: '',
    branch: '',
  });

  const [errors, setErrors] = useState({
    fname: '',
    lastname: '',
    branch: '',
  });

  const [existingStudent, setExistingStudent] = useState(false);

  useEffect(() => {
    // Check if student already exists in the database
    const checkStudentExists = async () => {
      try {
        const response = await fetch(`http://localhost:5000/students/${user.idnumber}`);
        const data = await response.json();

        if (response.ok && data.exists) {
          setExistingStudent(true);
          setFormData({
            student_id: user.idnumber, // Maintain the student ID
            fname: data.student.fname,
            lastname: data.student.lastname,
            branch: data.student.branch,
          });
        }
      } catch (error) {
        console.error('Error checking student existence:', error);
      }
    };

    checkStudentExists();
  }, [user.idnumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {
      fname: formData.fname ? '' : 'First name is required.',
      lastname: formData.lastname ? '' : 'Last name is required.',
      branch: formData.branch ? '' : 'Branch is required.',
    };
    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await fetch('http://localhost:5000/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (response.ok) {
          alert(`Student details ${existingStudent ? 'updated' : 'saved'} successfully!`);
          navigate('/');
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Error saving student data:', error);
      }
    }
  };

  return (
    <div>
      <h2>Student Dashboard</h2>
      {existingStudent ? (
        <p>You have already submitted your details. Enter again to update.</p>
      ) : (
        <p>Please fill in your details below.</p>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fname">First Name:</label>
          <input
            type="text"
            id="fname"
            name="fname"
            value={formData.fname}
            onChange={handleChange}
            required
          />
          {errors.fname && <p style={{ color: 'red' }}>{errors.fname}</p>}
        </div>

        <div>
          <label htmlFor="lastname">Last Name:</label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
          {errors.lastname && <p style={{ color: 'red' }}>{errors.lastname}</p>}
        </div>

        <div>
          <label htmlFor="branch">Branch:</label>
          <input
            type="text"
            id="branch"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            required
          />
          {errors.branch && <p style={{ color: 'red' }}>{errors.branch}</p>}
        </div>

        <button type="submit">{existingStudent ? 'Update' : 'Submit'}</button>
      </form>
    </div>
  );
};

export default StudentDashboard;

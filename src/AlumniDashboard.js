import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AlumniDashboard.css'
const AlumniDashboard = ({ user }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    alumni_id: user.idnumber,
    fname: '',
    lastname: '',
    graduation_year: '',
    industry: '',
  });

  const [errors, setErrors] = useState({
    fname: '',
    lastname: '',
    graduation_year: '',
    industry: '',
  });

  const [existingAlumni, setExistingAlumni] = useState(false);

  useEffect(() => {
    // Check if alumni already exists in the database
    const checkAlumniExists = async () => {
      try {
        const response = await fetch(`http://localhost:5000/alumni/${user.idnumber}`);
        const data = await response.json();

        if (data.exists) {
          setExistingAlumni(true);
          setFormData({
            ...formData,
            fname: data.alumni.fname,
            lastname: data.alumni.lastname,
            graduation_year: data.alumni.graduation_year,
            industry: data.alumni.industry,
          });
        }
      } catch (error) {
        console.error('Error checking alumni existence:', error);
      }
    };

    checkAlumniExists();
  }, [user.idnumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {
      fname: formData.fname ? '' : 'First name is required.',
      lastname: formData.lastname ? '' : 'Last name is required.',
      graduation_year: formData.graduation_year ? '' : 'Graduation year is required.',
      industry: formData.industry ? '' : 'Industry is required.',
    };
    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await fetch('http://localhost:5000/alumni', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (response.ok) {
          alert(`Alumni details ${existingAlumni ? 'updated' : 'saved'} successfully!`);
          navigate('/');
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Error saving alumni data:', error);
      }
    }
  };

  return (
    <div>
      <h2>Alumni Dashboard</h2>
      {existingAlumni ? (
        <p>You have already filled in your details. Update your information below if necessary.</p>
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
          <label htmlFor="graduation_year">Graduation Year:</label>
          <input
            type="number"
            id="graduation_year"
            name="graduation_year"
            value={formData.graduation_year}
            onChange={handleChange}
            required
          />
          {errors.graduation_year && <p style={{ color: 'red' }}>{errors.graduation_year}</p>}
        </div>

        <div>
          <label htmlFor="industry">Industry:</label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            required
          />
          {errors.industry && <p style={{ color: 'red' }}>{errors.industry}</p>}
        </div>

        <button type="submit">{existingAlumni ? 'Update' : 'Submit'}</button>
      </form>
    </div>
  );
};

export default AlumniDashboard;

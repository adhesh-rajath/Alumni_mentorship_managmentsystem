import React, { useState } from 'react';
import './About.css';

const About = () => {
  const [showAbout, setShowAbout] = useState(false);

  const toggleAbout = () => {
    setShowAbout(!showAbout);
  };

  return (
    <div className="about-container">
      <button onClick={toggleAbout} className="about-button">About</button>
      {showAbout && (
        <div className="about-box">
          <h2>Alumni Mentorship Platform</h2>
          <p>
            Welcome to the Alumni Mentorship Platform! This website is designed to connect students with experienced alumni across various industries and fields. By fostering one-on-one mentorship opportunities, students can gain invaluable insights, receive guidance tailored to their academic and career paths, and build connections within their desired fields.
          </p>
          <p>
            With a straightforward process to request mentorship sessions, students can explore advice on topics such as skill development, career planning, and industry-specific knowledge. Our alumni mentors volunteer their time and expertise to help students achieve their goals, making this platform a powerful resource for personal and professional growth.
          </p>
          <p>Join us in bridging the gap between education and career success through meaningful mentorship.</p>
          <button onClick={toggleAbout} className="close-button">Close</button>
        </div>
      )}
    </div>
  );
};

export default About;

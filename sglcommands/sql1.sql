USE mentorship_db;

CREATE TABLE session_mentoring (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(50),
  alumni_id VARCHAR(20),
  student_id VARCHAR(20),
  linktosession VARCHAR(255) DEFAULT 'https://defaultsessionlink.com',
  date TIMESTAMP NOT NULL,
  duration INT DEFAULT 60,
  FOREIGN KEY (alumni_id) REFERENCES alumni(alumni_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (request_id) REFERENCES mentor_requests(request_id)
);


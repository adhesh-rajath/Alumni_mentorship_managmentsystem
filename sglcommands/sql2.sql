USE mentorship_db;

CREATE TABLE students (
    student_id VARCHAR(20),
    email VARCHAR(100),
    fname VARCHAR(50),
    lastname VARCHAR(50),
    branch VARCHAR(50),
    PRIMARY KEY (student_id),
    FOREIGN KEY (student_id) REFERENCES loginuser(idnumber)
);

CREATE TABLE alumni (
    alumni_id VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    fname VARCHAR(50),
    lastname VARCHAR(50),
    graduation_year INT,
    industry VARCHAR(50),
    PRIMARY KEY (alumni_id),
    FOREIGN KEY (alumni_id) REFERENCES loginuser(idnumber)
);

CREATE TABLE IF NOT EXISTS alumnii (
    alumni_id VARCHAR(50) PRIMARY KEY,     -- Alumni ID (matches idnumber in loginuser)
    email VARCHAR(100) NOT NULL,           -- Email associated with alumni
    fname VARCHAR(50) NOT NULL,            -- First name
    lastname VARCHAR(50) NOT NULL,         -- Last name
    occupation VARCHAR(100),               -- Occupation (e.g., job title, 
    FOREIGN KEY (alumni_id) REFERENCES loginuser(idnumber) -- Foreign key to loginuser
);

CREATE TABLE profile_students (
  id VARCHAR(255) PRIMARY KEY,
  profile_id VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  FOREIGN KEY (id) REFERENCES loginuser(idnumber) ON DELETE CASCADE
);

CREATE TABLE profile_alumni (
  id VARCHAR(255) PRIMARY KEY,
  profile_id VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  githublink VARCHAR(255) DEFAULT 'No link available',
  FOREIGN KEY (id) REFERENCES loginuser(idnumber) ON DELETE CASCADE
);


CREATE TABLE students_skills (
    id VARCHAR(255) NOT NULL,
    skill VARCHAR(255) NOT NULL,
    FOREIGN KEY (id) REFERENCES loginuser(idnumber) ON DELETE CASCADE
);
CREATE TABLE alumni_expertise (
    id VARCHAR(50) NOT NULL,
    expertise VARCHAR(255) NOT NULL,
    PRIMARY KEY (id, expertise),
    FOREIGN KEY (id) REFERENCES loginuser(idnumber) ON DELETE CASCADE
);

CREATE TABLE mentor_requests (
    request_id VARCHAR(50) PRIMARY KEY,
    alumni_id VARCHAR(20),
    student_id VARCHAR(20),
    branch VARCHAR(50),
    topic VARCHAR(255),
    FOREIGN KEY (alumni_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);
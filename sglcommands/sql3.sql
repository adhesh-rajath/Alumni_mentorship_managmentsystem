USE mentorship_db;


CREATE TABLE loginuser (
    idnumber VARCHAR(20) PRIMARY KEY,
    role ENUM('Student', 'Alumni', 'Admin') NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

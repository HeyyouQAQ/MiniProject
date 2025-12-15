-- Role Table
CREATE TABLE IF NOT EXISTS Role (
    RoleID INT PRIMARY KEY AUTO_INCREMENT,
    Type VARCHAR(50) NOT NULL
);

-- Insert Default Roles
INSERT INTO Role (Type) VALUES ('Manager'), ('Worker');

-- Employee Table
CREATE TABLE IF NOT EXISTS Employee (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255),
    ContactNumber VARCHAR(20),
    HiringDate DATE,
    RoleID INT,
    ResetToken VARCHAR(255) NULL,
    ResetExpiry DATETIME NULL,
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID)
);

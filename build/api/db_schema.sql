-- Role Table
CREATE TABLE IF NOT EXISTS Role (
    RoleID INT PRIMARY KEY AUTO_INCREMENT,
    Type VARCHAR(50) NOT NULL UNIQUE
);

-- Insert Default Roles
<<<<<<< HEAD
INSERT INTO Role (Type) VALUES ('Manager'), ('Worker'), ('HR')
=======
INSERT INTO Role (Type) VALUES ('Manager'), ('Staff'), ('HR')
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
ON DUPLICATE KEY UPDATE Type=Type; -- Avoids errors on re-run

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
    HourlyRate DECIMAL(10, 2) DEFAULT 15.00, -- Added for payroll calculation
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS Attendance (
    AttendanceID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    ClockInTime DATETIME,
    ClockOutTime DATETIME,
    Status ENUM('Present', 'On Leave', 'Absent') DEFAULT 'Absent',
    WorkDate DATE,
    OverwrittenBy INT NULL, -- To track HR overrides
    FOREIGN KEY (UserID) REFERENCES Employee(UserID),
    FOREIGN KEY (OverwrittenBy) REFERENCES Employee(UserID),
    UNIQUE KEY (UserID, WorkDate) -- Ensures one record per user per day
);

-- Leave Application Table
CREATE TABLE IF NOT EXISTS LeaveApplication (
    LeaveID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    LeaveType ENUM('Annual', 'Sick', 'Unpaid', 'Other') NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Reason TEXT,
    Status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    ReviewedBy INT NULL, -- HR or Manager who reviewed
    FOREIGN KEY (UserID) REFERENCES Employee(UserID),
    FOREIGN KEY (ReviewedBy) REFERENCES Employee(UserID)
);

-- Payroll Table
CREATE TABLE IF NOT EXISTS Payroll (
    PayrollID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    PayPeriodStart DATE NOT NULL,
    PayPeriodEnd DATE NOT NULL,
    TotalHours DECIMAL(10, 2) NOT NULL,
    GrossPay DECIMAL(10, 2) NOT NULL,
    Deductions DECIMAL(10, 2) DEFAULT 0.00,
    NetPay DECIMAL(10, 2) NOT NULL,
    Status ENUM('Generated', 'Paid') DEFAULT 'Generated',
    GeneratedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    PaidDate DATETIME NULL,
    FOREIGN KEY (UserID) REFERENCES Employee(UserID)
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS ActivityLog (
    LogID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    Action VARCHAR(255) NOT NULL,
    Target VARCHAR(255),
    Type VARCHAR(50), -- e.g., 'User', 'System'
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Employee(UserID)
);

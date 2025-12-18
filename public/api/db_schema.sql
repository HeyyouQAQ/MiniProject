-- Role Table
CREATE TABLE IF NOT EXISTS Role (
    RoleID INT PRIMARY KEY AUTO_INCREMENT,
    Type VARCHAR(50) NOT NULL UNIQUE
);

-- Insert Default Roles
INSERT INTO Role (Type) VALUES ('Manager'), ('Staff'), ('HR')
ON DUPLICATE KEY UPDATE Type=Type; -- Avoids errors on re-run

-- Employee Table
CREATE TABLE IF NOT EXISTS Employee (
    UserID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    RoleID INT NOT NULL,

    Name VARCHAR(100) NOT NULL,
    ICNumber VARCHAR(20) NOT NULL UNIQUE,
    DateOfBirth DATE NOT NULL,
    Gender ENUM('Male','Female','Other') NOT NULL DEFAULT 'Other',
    ContactNumber VARCHAR(20) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Address TEXT,

    Position VARCHAR(50) NOT NULL DEFAULT 'Staff',
    EmploymentType ENUM('Full-Time','Part-Time','Contract') NOT NULL DEFAULT 'Full-Time',
    HiringDate DATE NOT NULL,
    EmploymentStatus ENUM('Active','Inactive','Resigned','Terminated') DEFAULT 'Active',

    BankName VARCHAR(50) NOT NULL DEFAULT 'N/A',
    BankAccountNumber VARCHAR(30) NOT NULL DEFAULT 'N/A',
    EPFNumber VARCHAR(30),
    SOCSONumber VARCHAR(30),
    EISNumber VARCHAR(30),

    FoodHandlerCertExpiry DATE,
    TyphoidExpiry DATE,

    PasswordHash VARCHAR(255) NOT NULL,
    ResetToken VARCHAR(255) NULL,
    ResetExpiry DATETIME NULL,

    EmergencyContactName VARCHAR(100),
    EmergencyContactNumber VARCHAR(20),

    HourlyRate DECIMAL(10, 2) DEFAULT 15.00,

    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_role
        FOREIGN KEY (RoleID)
        REFERENCES Role(RoleID)
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

-- System Configuration Table
CREATE TABLE IF NOT EXISTS SystemConfiguration (
    ConfigID INT PRIMARY KEY AUTO_INCREMENT,

    -- Leave Configuration
    DefaultAnnualLeaveDays INT DEFAULT 15,
    DefaultSickLeaveDays INT DEFAULT 14,
    CarryForwardLeaveLimit INT DEFAULT 5,

    -- Payroll Configuration
    PayrollCycleDay INT DEFAULT 25,
    OT_Rate_Per_Hour DECIMAL(10,2) DEFAULT 1.50,
    MinimumOTMinutes INT DEFAULT 30,
    LatePenaltyAmount DECIMAL(10,2) DEFAULT 5.00,
    AbsencePenaltyAmount DECIMAL(10,2) DEFAULT 20.00,

    -- Attendance Rules
    MinimumShiftBreakMins INT DEFAULT 60,
    MaxLateMinsAllowed INT DEFAULT 10,

    -- Shift & Scheduling Rules
    MaxDailyWorkingHours INT DEFAULT 8,
    MaxWeeklyWorkingHours INT DEFAULT 48,
    MinimumShiftHours INT DEFAULT 4,

    -- Audit Information
    LastModifiedBy INT,
    LastModifiedAt DATETIME DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (LastModifiedBy) REFERENCES Employee(UserID)
);

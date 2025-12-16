<?php
require 'db_connect.php';

// --- Attendance ---
$conn->query("DROP TABLE IF EXISTS Attendance");
$sql = "CREATE TABLE IF NOT EXISTS Attendance (
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
)";

if ($conn->query($sql) === TRUE) {
    echo "Table Attendance recreated successfully.<br>";
} else {
    echo "Error creating Attendance: " . $conn->error . "<br>";
}

// --- LeaveApplication ---
$conn->query("DROP TABLE IF EXISTS LeaveApplication");
$sqlLeave = "CREATE TABLE IF NOT EXISTS LeaveApplication (
    LeaveID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    LeaveType ENUM('Annual', 'Sick', 'Unpaid', 'Other') NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Reason TEXT,
    Status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    ReviewedBy INT NULL,
    FOREIGN KEY (UserID) REFERENCES Employee(UserID),
    FOREIGN KEY (ReviewedBy) REFERENCES Employee(UserID)
)";
if ($conn->query($sqlLeave) === TRUE) {
    echo "Table LeaveApplication recreated successfully.<br>";
} else {
    echo "Error creating LeaveApplication: " . $conn->error . "<br>";
}

// --- Payroll ---
$conn->query("DROP TABLE IF EXISTS Payroll");
$sqlPayroll = "CREATE TABLE IF NOT EXISTS Payroll (
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
)";
if ($conn->query($sqlPayroll) === TRUE) {
    echo "Table Payroll recreated successfully.<br>";
} else {
    echo "Error creating Payroll: " . $conn->error . "<br>";
}
?>

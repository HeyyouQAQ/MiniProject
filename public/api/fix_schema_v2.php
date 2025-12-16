<?php
require 'db_connect.php';

echo "Starting schema update...<br>";

// 1. Attendance
$attendance_sql = "CREATE TABLE IF NOT EXISTS Attendance (
    AttendanceID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    ClockInTime DATETIME,
    ClockOutTime DATETIME,
    Status ENUM('Present', 'On Leave', 'Absent') DEFAULT 'Absent',
    WorkDate DATE,
    OverwrittenBy INT NULL,
    FOREIGN KEY (UserID) REFERENCES Employee(UserID),
    FOREIGN KEY (OverwrittenBy) REFERENCES Employee(UserID),
    UNIQUE KEY (UserID, WorkDate)
)";
$conn->query("DROP TABLE IF EXISTS Attendance");
if ($conn->query($attendance_sql) === TRUE) {
    echo "Attendance created.<br>";
} else {
    echo "Error Attendance: " . $conn->error . "<br>";
}

// 2. LeaveApplication
$leave_sql = "CREATE TABLE IF NOT EXISTS LeaveApplication (
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
$conn->query("DROP TABLE IF EXISTS LeaveApplication");
if ($conn->query($leave_sql) === TRUE) {
    echo "LeaveApplication created.<br>";
} else {
    echo "Error LeaveApplication: " . $conn->error . "<br>";
}

// 3. Payroll
$payroll_sql = "CREATE TABLE IF NOT EXISTS Payroll (
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
$conn->query("DROP TABLE IF EXISTS Payroll");
if ($conn->query($payroll_sql) === TRUE) {
    echo "Payroll created.<br>";
} else {
    echo "Error Payroll: " . $conn->error . "<br>";
}

echo "Done.";
?>

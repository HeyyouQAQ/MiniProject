<?php
require 'public/api/db_connect.php';

// Check attendance data
$month = 12;
$year = 2025;

echo "=== ATTENDANCE DATA ===\n";
$attQuery = "SELECT WorkDate, Status FROM Attendance WHERE MONTH(WorkDate) = $month AND YEAR(WorkDate) = $year LIMIT 5";
$attResult = $conn->query($attQuery);
echo "Attendance records found: " . $attResult->num_rows . "\n";
while ($row = $attResult->fetch_assoc()) {
    echo "Date: {$row['WorkDate']}, Status: {$row['Status']}\n";
}

echo "\n=== PAYROLL DATA ===\n";
$payQuery = "SELECT e.Name, p.NetPay FROM Payroll p JOIN Employee e ON p.UserID = e.UserID WHERE MONTH(p.PayPeriodEnd) = $month AND YEAR(p.PayPeriodEnd) = $year LIMIT 5";
$payResult = $conn->query($payQuery);
echo "Payroll records found: " . $payResult->num_rows . "\n";
while ($row = $payResult->fetch_assoc()) {
    echo "Employee: {$row['Name']}, NetPay: {$row['NetPay']}\n";
}

echo "\n=== LEAVE DATA ===\n";
$leaveQuery = "SELECT LeaveType, StartDate, EndDate, Status FROM LeaveApplication WHERE Status = 'Approved' AND MONTH(StartDate) = $month AND YEAR(StartDate) = $year LIMIT 5";
$leaveResult = $conn->query($leaveQuery);
echo "Leave records found: " . $leaveResult->num_rows . "\n";
while ($row = $leaveResult->fetch_assoc()) {
    echo "Type: {$row['LeaveType']}, Start: {$row['StartDate']}, End: {$row['EndDate']}\n";
}
?>
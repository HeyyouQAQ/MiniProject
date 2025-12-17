<?php
require 'db_connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Roles</h2>";
$roles = $conn->query("SELECT * FROM Role");
if ($roles) {
    while ($row = $roles->fetch_assoc()) {
        echo "ID: " . $row['RoleID'] . " - Type: " . $row['Type'] . "<br>";
    }
} else {
    echo "Error fetching roles: " . $conn->error;
}

echo "<h2>Employees</h2>";
$emps = $conn->query("SELECT UserID, Name, RoleID FROM Employee");
if ($emps) {
    while ($row = $emps->fetch_assoc()) {
        echo "ID: " . $row['UserID'] . " - Name: " . $row['Name'] . " - RoleID: " . ($row['RoleID'] ?? 'NULL') . "<br>";
    }
} else {
    echo "Error fetching employees: " . $conn->error;
}

echo "<h2>Payroll Records</h2>";
$pay = $conn->query("SELECT * FROM Payroll");
if ($pay) {
    echo "Count: " . $pay->num_rows . "<br>";
}

?>

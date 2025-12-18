<?php
require 'db_connect.php';
header('Content-Type: application/json');

$debug = [];

if (!$conn) {
    die(json_encode(["error" => "Connection failed"]));
}

// Check Roles
$res = $conn->query("SELECT * FROM Role");
if (!$res) {
    die(json_encode(["error" => "Role query failed: " . $conn->error]));
}
$roles = [];
while($row = $res->fetch_assoc()) {
    $roles[] = $row;
}
$debug['Roles'] = $roles;

// Check Employees
$res = $conn->query("SELECT e.UserID, e.Username, r.Type as RoleType FROM Employee e JOIN Role r ON e.RoleID = r.RoleID LIMIT 10");
if (!$res) {
    die(json_encode(["error" => "Employee query failed: " . $conn->error]));
}
$employees = [];
while($row = $res->fetch_assoc()) {
    $employees[] = $row;
}
$debug['Employees_Sample'] = $employees;

// Test Query Logic for Manager
$managerQuery = "
    SELECT 
        e.UserID, e.Username, e.FullName, e.Email, r.Type as Role
    FROM Employee e
    JOIN Role r ON e.RoleID = r.RoleID
    WHERE r.Type IN ('Staff', 'HR')
";
$res = $conn->query($managerQuery);
if (!$res) {
    die(json_encode(["error" => "Manager query failed: " . $conn->error]));
}
$managerResults = [];
while($row = $res->fetch_assoc()) {
    $managerResults[] = $row;
}
$debug['Manager_Query_Results'] = $managerResults;

echo json_encode($debug);
?>

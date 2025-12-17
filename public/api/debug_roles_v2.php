<?php
require 'db_connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$data = [];

$roles = $conn->query("SELECT * FROM Role");
$data['roles'] = [];
while ($row = $roles->fetch_assoc()) {
    $data['roles'][] = $row;
}

$emps = $conn->query("SELECT UserID, Name, RoleID FROM Employee");
$data['employees'] = [];
while ($row = $emps->fetch_assoc()) {
    $data['employees'][] = $row;
}

$pay = $conn->query("SELECT * FROM Payroll");
$data['payroll_count'] = $pay->num_rows;
$data['payroll_examples'] = [];
$c=0;
while ($row = $pay->fetch_assoc()) {
    if($c++ < 5) $data['payroll_examples'][] = $row;
}

echo json_encode($data);
?>

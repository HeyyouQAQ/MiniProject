<?php
require 'db_connect.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$debug = [];

// Helper to get Role ID
function getRoleIdDebug($conn, $type) {
    $stmt = $conn->prepare("SELECT RoleID FROM Role WHERE Type = ?");
    $stmt->bind_param("s", $type);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($row = $res->fetch_assoc()) return $row['RoleID'];
    return "NOT FOUND";
}

$debug['Role_Staff_ID'] = getRoleIdDebug($conn, 'Staff');
$debug['Role_Worker_ID'] = getRoleIdDebug($conn, 'Worker');
$debug['Role_HR_ID'] = getRoleIdDebug($conn, 'HR');
$debug['Role_Manager_ID'] = getRoleIdDebug($conn, 'Manager');

if (is_numeric($debug['Role_Staff_ID'])) {
    $id = $debug['Role_Staff_ID'];
    $res = $conn->query("SELECT COUNT(*) as c FROM Employee WHERE RoleID=$id");
    $debug['Count_By_Staff_Role'] = $res->fetch_assoc()['c'];
}

if (is_numeric($debug['Role_Worker_ID'])) {
    $id = $debug['Role_Worker_ID'];
    $res = $conn->query("SELECT COUNT(*) as c FROM Employee WHERE RoleID=$id");
    $debug['Count_By_Worker_Role'] = $res->fetch_assoc()['c'];
}

// Dump all roles
$roleDump = [];
$res = $conn->query("SELECT * FROM Role");
while($row = $res->fetch_assoc()) {
    $roleDump[] = $row;
}
$debug['All_Roles'] = $roleDump;

echo json_encode($debug);
?>

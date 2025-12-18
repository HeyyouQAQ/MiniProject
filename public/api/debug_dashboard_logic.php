<?php
require 'db_connect.php';

$stats = [];
$log = "";

// Helper to get Role ID
function getRoleId($conn, $type) {
    $stmt = $conn->prepare("SELECT RoleID FROM Role WHERE Type = ?");
    $stmt->bind_param("s", $type);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($row = $res->fetch_assoc()) return $row['RoleID'];
    return 0;
}

$staffRoleId = getRoleId($conn, 'Staff');
$log .= "Staff Role ID: $staffRoleId\n";
if ($staffRoleId == 0) {
    $staffRoleId = getRoleId($conn, 'Worker');
    $log .= "Fallback Worker Role ID: $staffRoleId\n";
}
$hrRoleId = getRoleId($conn, 'HR');
$log .= "HR Role ID: $hrRoleId\n";

// Staff Count
$res = $conn->query("SELECT COUNT(*) as c FROM Employee WHERE RoleID=$staffRoleId");
$row = $res->fetch_assoc();
$stats['staffCount'] = $row['c'];

// HR Count
$res = $conn->query("SELECT COUNT(*) as c FROM Employee WHERE RoleID=$hrRoleId");
$row = $res->fetch_assoc();
$stats['hrCount'] = $row['c'];

// Total Users
$res = $conn->query("SELECT COUNT(*) as c FROM Employee");
$row = $res->fetch_assoc();
$stats['totalUsers'] = $row['c'];

$log .= "Calculated Stats:\n";
$log .= print_r($stats, true);

file_put_contents('debug_dashboard_logic.txt', $log);
echo "Logic debugged to debug_dashboard_logic.txt";
?>

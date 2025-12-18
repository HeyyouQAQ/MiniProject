<?php
require 'db_connect.php';

$log = "Deep Database Debug\n\n";

// 1. Check Roles
$log .= "Roles Table:\n";
$res = $conn->query("SELECT * FROM Role");
if ($res) {
    while($row = $res->fetch_assoc()) {
        $log .= "ID: " . $row['RoleID'] . " - Type: '" . $row['Type'] . "'\n";
    }
}

// 2. Check Employee Counts by RoleID
$log .= "\nEmployee Counts by RoleID:\n";
$res = $conn->query("SELECT RoleID, COUNT(*) as count FROM Employee GROUP BY RoleID");
if ($res) {
    while($row = $res->fetch_assoc()) {
        $log .= "RoleID: " . $row['RoleID'] . " - Count: " . $row['count'] . "\n";
    }
}

// 3. Test the Logic used in dashboard.php
$log .= "\nTesting dashboard.php Logic:\n";
function getRoleIdDebug($conn, $type) {
    $stmt = $conn->prepare("SELECT RoleID FROM Role WHERE Type = ?");
    $stmt->bind_param("s", $type);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($row = $res->fetch_assoc()) return $row['RoleID'];
    return "NOT FOUND";
}

$log .= "Searching for 'Staff': " . getRoleIdDebug($conn, 'Staff') . "\n";
$log .= "Searching for 'Worker': " . getRoleIdDebug($conn, 'Worker') . "\n";
$log .= "Searching for 'HR': " . getRoleIdDebug($conn, 'HR') . "\n";
$log .= "Searching for 'Manager': " . getRoleIdDebug($conn, 'Manager') . "\n";

file_put_contents('debug_log.txt', $log);
echo "Log written to debug_log.txt";
?>

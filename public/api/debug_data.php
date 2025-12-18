<?php
require 'db_connect.php';

echo "Conn status: " . ($conn ? "OK" : "NULL") . "\n";

$sql = "SELECT e.UserID, e.Username, r.Type FROM Employee e JOIN Role r ON e.RoleID = r.RoleID LIMIT 5";
$res = $conn->query($sql);

if ($res) {
    echo "Query OK. Rows: " . $res->num_rows . "\n";
    while ($row = $res->fetch_assoc()) {
        echo "User: " . $row['Username'] . " Role: " . $row['Type'] . "\n";
    }
} else {
    echo "Query Failed: " . $conn->error . "\n";
}

echo "--- Manager Query Test ---\n";
$managerQuery = "
    SELECT e.UserID, e.Username, r.Type 
    FROM Employee e
    JOIN Role r ON e.RoleID = r.RoleID
    WHERE r.Type IN ('Staff', 'HR')
";
$res2 = $conn->query($managerQuery);
if ($res2) {
    echo "Manager Query OK. Rows: " . $res2->num_rows . "\n";
} else {
    echo "Manager Query Failed: " . $conn->error . "\n";
}
?>

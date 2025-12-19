<?php
require_once 'db_connect.php';

// Check file content
echo "File Content (users.php lines 240-260):\n";
$lines = file('users.php');
for ($i = 240; $i < 260; $i++) {
    echo ($i+1) . ": " . htmlspecialchars($lines[$i]);
}

// Check User 3
echo "\n\nChecking User 3:\n";
$stmt = $conn->prepare("SELECT UserID, Name, RoleID FROM Employee WHERE UserID = ?");
$id = 3;
$stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result();
if ($row = $res->fetch_assoc()) {
    echo "User 3 found: " . print_r($row, true);
} else {
    echo "User 3 NOT FOUND";
}
?>

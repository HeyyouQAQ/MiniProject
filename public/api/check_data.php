<?php
require 'db_connect.php';
$result = $conn->query("SELECT COUNT(*) as count FROM Attendance");
$row = $result->fetch_assoc();
echo "Rows: " . $row['count'];
?>

<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

require 'db_connect.php';

// Get table structure
$result = $conn->query("DESCRIBE Schedule");
$columns = [];
while ($row = $result->fetch_assoc()) {
    $columns[] = $row;
}

echo json_encode(["columns" => $columns]);
$conn->close();
?>

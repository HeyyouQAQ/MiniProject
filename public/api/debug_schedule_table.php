<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

require 'db_connect.php';

// Test connection
if (!$conn) {
    echo json_encode(["error" => "No connection"]);
    exit;
}

// Check if Schedule table exists
$tableCheck = $conn->query("SHOW TABLES LIKE 'Schedule'");
if ($tableCheck->num_rows == 0) {
    echo json_encode(["error" => "Schedule table does not exist"]);
    exit;
}

// Simple query
$result = $conn->query("SELECT * FROM Schedule LIMIT 5");
if (!$result) {
    echo json_encode(["error" => "Query failed: " . $conn->error]);
    exit;
}

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode(["status" => "success", "table_exists" => true, "data" => $data]);
$conn->close();
?>

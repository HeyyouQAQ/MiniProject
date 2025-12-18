<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$servername = "localhost";
$username = "root";
$password = ""; 
$dbname = "hr_system";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection and kill script ONLY if there is an error
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

$conn->set_charset("utf8mb4");

// Function to log activity
function logActivity($conn, $user_id, $action, $target, $type) {
    $stmt = $conn->prepare("INSERT INTO activity_log (user_id, action, target, type) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $user_id, $action, $target, $type);
    $stmt->execute();
}
// Set timezone
date_default_timezone_set('Asia/Kuala_Lumpur');
?>

<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

require 'db_connect.php';

// Drop and recreate Schedule table
$conn->query("DROP TABLE IF EXISTS Schedule");

$sql = "CREATE TABLE Schedule (
    ScheduleID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    ShiftDate DATE NOT NULL,
    StartTime TIME,
    EndTime TIME,
    TaskDescription VARCHAR(255),
    Status ENUM('Scheduled', 'Completed', 'Off') DEFAULT 'Scheduled',
    CreatedBy INT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Employee(UserID),
    UNIQUE KEY (UserID, ShiftDate)
)";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success", "message" => "Schedule table recreated successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error: " . $conn->error]);
}

$conn->close();
?>

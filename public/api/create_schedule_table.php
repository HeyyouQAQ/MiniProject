<?php
// Script to create Schedule table
require 'db_connect.php';

$sql = "CREATE TABLE IF NOT EXISTS Schedule (
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
    FOREIGN KEY (CreatedBy) REFERENCES Employee(UserID),
    UNIQUE KEY (UserID, ShiftDate)
)";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success", "message" => "Schedule table created successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error: " . $conn->error]);
}

$conn->close();
?>

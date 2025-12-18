<?php
$servername = "localhost";
$username = "root";
$password = ""; 
$dbname = "hr_system";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Add EmploymentStatus column if not exists
$sql = "ALTER TABLE Employee ADD COLUMN EmploymentStatus VARCHAR(20) DEFAULT 'Active'";
try {
    if ($conn->query($sql) === TRUE) {
        echo "Column EmploymentStatus added successfully";
    } else {
        echo "Error adding column: " . $conn->error;
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage();
}

echo "\n";
?>

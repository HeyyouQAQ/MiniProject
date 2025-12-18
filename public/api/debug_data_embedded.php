<?php
$servername = "localhost";
$username = "root";
$password = ""; 
$dbname = "hr_system";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Conn type: " . gettype($conn) . "\n";
if ($conn instanceof mysqli) {
    echo "Conn is mysqli object.\n";
}

$sql = "SELECT Name, Email FROM Employee";
try {
    $res = $conn->query($sql);
} catch (Exception $e) {
    die("Exception: " . $e->getMessage());
}

if ($res) {
    echo "Employee Data:\n";
    while ($row = $res->fetch_assoc()) {
        echo "Name: " . ($row['Name'] ?? 'NULL') . " - Email: " . ($row['Email'] ?? 'NULL') . "\n";
    }
}
?>

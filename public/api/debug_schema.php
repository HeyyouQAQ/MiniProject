<?php
require 'db_connect.php';

$result = $conn->query("SHOW COLUMNS FROM Attendance");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " - " . $row['Type'] . "<br>";
    }
} else {
    echo "Error showing columns: " . $conn->error;
}
?>

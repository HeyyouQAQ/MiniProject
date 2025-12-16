<?php
require 'db_connect.php';

function checkTable($conn, $tableName) {
    echo "<h3>$tableName</h3>";
    $result = $conn->query("SHOW COLUMNS FROM $tableName");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            echo $row['Field'] . " - " . $row['Type'] . "<br>";
        }
    } else {
        echo "Error showing columns for $tableName: " . $conn->error;
    }
}

checkTable($conn, 'LeaveApplication');
checkTable($conn, 'Payroll');
?>

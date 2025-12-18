<?php
require 'db_connect.php';

$result = $conn->query("DESCRIBE EmployeeSalarySetup");
if ($result) {
    echo "Table Exists. Columns:\n";
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " - " . $row['Type'] . "\n";
    }
} else {
    echo "Table Error: " . $conn->error;
}
?>

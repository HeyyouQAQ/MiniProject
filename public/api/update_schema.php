<?php
require_once 'db_connect.php';

function addColumn ($conn, $table, $column, $type) {
    try {
        $sql = "ALTER TABLE $table ADD COLUMN $column $type";
        if ($conn->query($sql) === TRUE) {
            echo "Column $column added successfully to $table.<br>";
        } else {
            // Check if error is due to column already existing (Error 1060)
            if ($conn->errno == 1060) {
                echo "Column $column already exists in $table.<br>";
            } else {
                echo "Error adding column $column: " . $conn->error . "<br>";
            }
        }
    } catch (Exception $e) {
        echo "Exception: " . $e->getMessage() . "<br>";
    }
}

echo "Updating Database Schema...<br>";

// Add ResetToken
addColumn($conn, 'Employee', 'ResetToken', 'VARCHAR(255) NULL');

// Add ResetExpiry
addColumn($conn, 'Employee', 'ResetExpiry', 'DATETIME NULL');

echo "Schema update completed.";
?>

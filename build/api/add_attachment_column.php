<?php
require 'db_connect.php';

// Add AttachmentPath column to LeaveApplication table if it doesn't exist
$checkColumn = $conn->query("SHOW COLUMNS FROM LeaveApplication LIKE 'AttachmentPath'");
if ($checkColumn->num_rows == 0) {
    $alterSql = "ALTER TABLE LeaveApplication ADD COLUMN AttachmentPath VARCHAR(500) NULL";
    if ($conn->query($alterSql)) {
        echo "SUCCESS: AttachmentPath column added to LeaveApplication table.\n";
    } else {
        echo "ERROR: Failed to add column - " . $conn->error . "\n";
    }
} else {
    echo "INFO: AttachmentPath column already exists.\n";
}

// Create uploads directory if it doesn't exist
$uploadsDir = __DIR__ . '/uploads/leave_docs';
if (!is_dir($uploadsDir)) {
    if (mkdir($uploadsDir, 0755, true)) {
        echo "SUCCESS: Created uploads directory at " . $uploadsDir . "\n";
    } else {
        echo "ERROR: Failed to create uploads directory.\n";
    }
} else {
    echo "INFO: Uploads directory already exists.\n";
}

$conn->close();
echo "\nDone!";
?>

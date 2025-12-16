<?php
require 'public/api/db_connect.php';
$result = $conn->query("SELECT LeaveID, AttachmentPath FROM LeaveApplication WHERE AttachmentPath IS NOT NULL");
while ($row = $result->fetch_assoc()) {
    echo "ID: " . $row['LeaveID'] . " | Path: " . $row['AttachmentPath'] . "\n";
}
?>
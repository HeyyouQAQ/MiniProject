<?php
require 'db_connect.php';

$sql = "SELECT * FROM Role";
$result = $conn->query($sql);

if ($result) {
    echo "Roles found:\n";
    while ($row = $result->fetch_assoc()) {
        echo "ID: " . $row['RoleID'] . " - Type: '" . $row['Type'] . "'\n";
    }
} else {
    echo "Error: " . $conn->error;
}
?>

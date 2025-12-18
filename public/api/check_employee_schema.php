<?php
require 'db_connect.php';

echo "Describing Employee Table:\n";
$res = $conn->query("DESCRIBE Employee");
if ($res) {
    while($row = $res->fetch_assoc()) {
        echo $row['Field'] . "\n";
    }
} else {
    echo "Error describing Employee: " . $conn->error;
}
?>

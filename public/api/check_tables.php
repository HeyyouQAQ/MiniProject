<?php
require 'db_connect.php';

echo "Tables in DB:\n";
$res = $conn->query("SHOW TABLES");
if ($res) {
    while($row = $res->fetch_array()) {
        echo $row[0] . "\n";
    }
}

echo "\nDescribing Attendance:\n";
$res = $conn->query("DESCRIBE Attendance");
if ($res) {
    while($row = $res->fetch_assoc()) {
        print_r($row);
    }
} else {
    echo "Error describing Attendance: " . $conn->error;
}
?>

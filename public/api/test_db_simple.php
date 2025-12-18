<?php
require 'db_connect.php';
if (isset($conn)) {
    echo "Conn is set. ";
    if ($conn instanceof mysqli) {
        echo "Conn is mysqli object. ";
        echo "Host info: " . $conn->host_info;
    } else {
        echo "Conn is NOT mysqli object.";
    }
} else {
    echo "Conn is NOT set.";
}
?>

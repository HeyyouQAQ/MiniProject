<?php
// Attempt to require db_connect.php to see if it causes a crash
require 'db_connect.php';

echo json_encode(["status" => "success", "message" => "Connected to Database Successfully!"]);
?>

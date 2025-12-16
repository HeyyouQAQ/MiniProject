<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "hr_system";

// Create connection to MySQL server
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection to MySQL server failed: " . $conn->connect_error]));
}

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS $dbname";
if ($conn->query($sql) === TRUE) {
    echo "<p>Database '$dbname' created or already exists.</p>";
} else {
    die(json_encode(["status" => "error", "message" => "Error creating database: " . $conn->error]));
}

// Select the database
$conn->select_db($dbname);

// Read the schema file
$schema_sql = file_get_contents('db_schema.sql');
if ($schema_sql === false) {
    die(json_encode(["status" => "error", "message" => "Could not read db_schema.sql file."]));
}

// Execute the multi-query for creating tables
if ($conn->multi_query($schema_sql)) {
    do {
        // Store first result set
        if ($result = $conn->store_result()) {
            $result->free();
        }
    } while ($conn->next_result());
    echo "<p>Database tables created successfully from db_schema.sql.</p>";
} else {
    echo json_encode(["status" => "error", "message" => "Error creating tables: " . $conn->error]);
}


echo json_encode(["status" => "success", "message" => "Database and tables setup complete."]);

$conn->close();
?>


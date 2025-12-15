<?php
require 'db_connect.php';

echo "<h2>Roles</h2>";
$roles = $conn->query("SELECT * FROM Role");
if ($roles) {
    echo "<table border='1'><tr><th>ID</th><th>Type</th></tr>";
    while ($r = $roles->fetch_assoc()) {
        echo "<tr><td>{$r['RoleID']}</td><td>{$r['Type']}</td></tr>";
    }
    echo "</table>";
} else {
    echo "Error fetching roles: " . $conn->error;
}

echo "<h2>Employees</h2>";
$emps = $conn->query("SELECT * FROM Employee");
if ($emps) {
    echo "<table border='1'><tr><th>ID</th><th>Name</th><th>Email</th><th>RoleID</th><th>Password</th></tr>";
    while ($e = $emps->fetch_assoc()) {
        echo "<tr><td>{$e['UserID']}</td><td>{$e['Name']}</td><td>{$e['Email']}</td><td>{$e['RoleID']}</td><td>{$e['PasswordHash']}</td></tr>";
    }
    echo "</table>";
} else {
    echo "Error fetching employees: " . $conn->error;
}

echo "<h2>Debug Login Query</h2>";
$username = "admin";
$stmt = $conn->prepare("SELECT e.UserID, e.Name, e.RoleID, e.PasswordHash, r.Type as RoleName 
                      FROM Employee e 
                      JOIN Role r ON e.RoleID = r.RoleID 
                      WHERE e.Name = ? OR e.Email = ?");
$stmt->bind_param("ss", $username, $username);
$stmt->execute();
$res = $stmt->get_result();
echo "Query for 'admin': " . $res->num_rows . " rows found.<br>";
while ($row = $res->fetch_assoc()) {
    print_r($row);
    echo "<br>";
}
?>

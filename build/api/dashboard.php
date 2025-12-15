<?php
require_once 'db_connect.php';

// Stats
$stats = [];

// Total Employees
$res = $conn->query("SELECT COUNT(*) as c FROM Employee");
$row = $res->fetch_assoc();
$stats['totalUsers'] = $row['c'];

// Workers (RoleID 3)
$res = $conn->query("SELECT COUNT(*) as c FROM Employee WHERE RoleID=3"); // Assuming 3 is Worker
$row = $res->fetch_assoc();
$stats['staffCount'] = $row['c']; // Re-using key 'staffCount' for frontend compatibility

// HR (RoleID 2)
$res = $conn->query("SELECT COUNT(*) as c FROM Employee WHERE RoleID=2"); // Assuming 2 is HR
$row = $res->fetch_assoc();
$stats['hrCount'] = $row['c'];

// Not using base Salary anymore
$stats['baseSalary'] = 'N/A';


// Recent Activities? 
// The new schema doesn't have ActivityLog table. 
// We will return empty or mock.
$activities = [];

// If we want to verify the created employee, we can just return the latest employees
$latestSql = "SELECT Name, r.Type as RoleName, HiringDate 
              FROM Employee e 
              JOIN Role r ON e.RoleID = r.RoleID 
              ORDER BY UserID DESC LIMIT 5";
$res = $conn->query($latestSql);
if ($res->num_rows > 0) {
    while($row = $res->fetch_assoc()) {
        $activities[] = [
            'action' => 'New Joiner',
            'user' => $row['Name'] . ' (' . $row['RoleName'] . ')',
            'time' => $row['HiringDate'],
            'type' => 'create'
        ];
    }
}


echo json_encode([
    "stats" => $stats,
    "activities" => $activities
]);

$conn->close();
?>

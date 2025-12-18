<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'db_connect.php';

// Stats
$stats = [];

// Total Employees
$res = $conn->query("SELECT COUNT(*) as c FROM Employee");
$row = $res->fetch_assoc();
$stats['totalUsers'] = $row['c'];

// Helper to get Role ID
function getRoleId($conn, $type) {
    $stmt = $conn->prepare("SELECT RoleID FROM Role WHERE Type = ?");
    $stmt->bind_param("s", $type);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($row = $res->fetch_assoc()) return $row['RoleID'];
    return 0;
}

$staffRoleId = getRoleId($conn, 'Staff');
if ($staffRoleId == 0) {
    $staffRoleId = getRoleId($conn, 'Worker');
}
$hrRoleId = getRoleId($conn, 'HR');

// Staff
$res = $conn->query("SELECT COUNT(*) as c FROM Employee WHERE RoleID=$staffRoleId");
$row = $res->fetch_assoc();
$stats['staffCount'] = $row['c'];

// HR
$res = $conn->query("SELECT COUNT(*) as c FROM Employee WHERE RoleID=$hrRoleId");
$row = $res->fetch_assoc();
$stats['hrCount'] = $row['c'];

// Pending Leave Applications
$res = $conn->query("SELECT COUNT(*) as c FROM LeaveApplication WHERE Status = 'Pending'");
$row = $res->fetch_assoc();
$stats['pendingLeaves'] = $row['c'];

// Employees Clocked In Today (total who worked today - includes those who clocked out)
$today = date('Y-m-d');
$res = $conn->query("SELECT COUNT(DISTINCT UserID) as c FROM Attendance WHERE DATE(ClockIn) = '$today' AND ClockIn IS NOT NULL");
$row = $res->fetch_assoc();
$stats['clockedInToday'] = $row['c'];

// Employees Clocked Out Today (completed their shift)
$res = $conn->query("SELECT COUNT(DISTINCT UserID) as c FROM Attendance WHERE DATE(ClockIn) = '$today' AND ClockIn IS NOT NULL AND ClockOut IS NOT NULL");
$row = $res->fetch_assoc();
$stats['clockedOutToday'] = $row['c'];

// Total employees for HR dashboard
$stats['totalEmployees'] = $stats['totalUsers'];

// Fetch Base Hourly Rate from SystemConfiguration (with error handling)
$stats['baseSalary'] = '15.00'; // Default
try {
    $configRes = @$conn->query("SELECT DefaultHourlyRate FROM SystemConfiguration LIMIT 1");
    if ($configRes && $configRes->num_rows > 0) {
        $configRow = $configRes->fetch_assoc();
        if (isset($configRow['DefaultHourlyRate'])) {
            $stats['baseSalary'] = number_format((float)$configRow['DefaultHourlyRate'], 2);
        }
    }
} catch (Exception $e) {
    // Silently fail, use default
}


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
    while ($row = $res->fetch_assoc()) {
        $activities[] = [
            'action' => 'New Joiner',
            'user' => $row['Name'] . ' (' . $row['RoleName'] . ')',
            'time' => $row['HiringDate'],
            'type' => 'create'
        ];
    }
}


// Debugging: return calculator stats in response
echo json_encode([
    "stats" => $stats,
    "activities" => $activities,
    "debug_info" => [
        "staff_role_id" => $staffRoleId,
        "hr_role_id" => $hrRoleId,
        "raw_stats" => $stats
    ]
]);

$conn->close();
?>
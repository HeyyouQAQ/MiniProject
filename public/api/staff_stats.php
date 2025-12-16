<?php
require 'db_connect.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$userId = $_GET['userId'] ?? 0;

if (!$userId) {
    echo json_encode(["status" => "error", "message" => "User ID required"]);
    exit;
}

// 1. Hours Worked (This Week)
// Week starts Monday
$monday = date('Y-m-d', strtotime('monday this week'));
$sunday = date('Y-m-d', strtotime('sunday this week'));

$hoursSql = "SELECT ClockInTime, ClockOutTime FROM Attendance 
             WHERE UserID = ? AND WorkDate BETWEEN ? AND ? 
             AND ClockInTime IS NOT NULL AND ClockOutTime IS NOT NULL";
$stmt = $conn->prepare($hoursSql);
$stmt->bind_param("iss", $userId, $monday, $sunday);
$stmt->execute();
$res = $stmt->get_result();

$totalSeconds = 0;
$otSeconds = 0;
$shiftEndStr = '18:30:00'; // Hardcoded sync with payroll logic

while ($row = $res->fetch_assoc()) {
    $in = strtotime($row['ClockInTime']);
    $out = strtotime($row['ClockOutTime']);
    $totalSeconds += ($out - $in);

    // OT
    $date = date('Y-m-d', $in);
    $shiftEndCallback = strtotime("$date $shiftEndStr");
    if ($out > $shiftEndCallback) {
        $otSeconds += ($out - $shiftEndCallback);
    }
}

$hoursWorked = round($totalSeconds / 3600, 1);
$otHours = round($otSeconds / 3600, 1);


// 2. Salary (Latest 2 Payrolls)
$paySql = "SELECT NetPay, PayPeriodEnd FROM Payroll WHERE UserID = ? ORDER BY PayPeriodEnd DESC LIMIT 2";
$stmt = $conn->prepare($paySql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$payRes = $stmt->get_result();

$salary = 0;
$lastPayStr = 'N/A';
$payPeriodStr = 'No Data';
$prevPayStr = 'vs Last Month: N/A';

if ($row = $payRes->fetch_assoc()) {
    // Latest
    $salary = $row['NetPay'];
    $lastPayStr = 'RM ' . number_format($salary, 2);
    $payPeriodStr = date('F Y', strtotime($row['PayPeriodEnd']));

    // Previous
    if ($prevRow = $payRes->fetch_assoc()) {
        $prevSalary = $prevRow['NetPay'];
        $diff = $salary - $prevSalary;
        $sign = $diff >= 0 ? '+' : '';
        // E.g. "Last Month: RM 1200.00"
        $prevPayStr = "Last Month: RM " . number_format($prevSalary, 2);
    }
}

// 3. Total Leave Taken (Approved Leaves in Current Year)
$currentYear = date('Y');
$leaveSql = "SELECT LeaveType, StartDate, EndDate FROM LeaveApplication 
             WHERE UserID = ? AND Status = 'Approved' 
             AND YEAR(StartDate) = ?";
$stmt = $conn->prepare($leaveSql);
$stmt->bind_param("ii", $userId, $currentYear);
$stmt->execute();
$leaveRes = $stmt->get_result();

$leaveDays = 0;
$breakdown = [];

while ($row = $leaveRes->fetch_assoc()) {
    $start = new DateTime($row['StartDate']);
    $end = new DateTime($row['EndDate']);
    $days = $end->diff($start)->days + 1;
    $leaveDays += $days;

    $type = $row['LeaveType'];
    if (!isset($breakdown[$type])) {
        $breakdown[$type] = 0;
    }
    $breakdown[$type] += $days;
}

// Format breakdown string
$breakdownStr = "";
foreach ($breakdown as $type => $days) {
    // e.g. "Annual: 10, Sick: 5"
    if ($breakdownStr !== "")
        $breakdownStr .= ", ";
    $breakdownStr .= "$type: $days";
}

if ($breakdownStr === "")
    $breakdownStr = "None";

echo json_encode([
    "status" => "success",
    "data" => [
        "hoursWorked" => $hoursWorked,
        "otHours" => $otHours,
        "lastPay" => $lastPayStr,
        "payPeriod" => $payPeriodStr,
        "prevPay" => $prevPayStr,
        "leaveTaken" => $leaveDays,
        "leaveBreakdown" => $breakdownStr
    ]
]);

$conn->close();
?>
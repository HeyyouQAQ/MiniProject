<?php
require 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method == 'GET' && $action == 'generate_report') {
    $month = $_GET['month'] ?? date('m');
    $year = $_GET['year'] ?? date('Y');
    $format = $_GET['format'] ?? 'json';

    // Fetch Payroll Data
    $payrollSql = "SELECT e.Name, p.TotalHours, p.GrossPay, p.Deductions, p.NetPay 
                   FROM Payroll p
                   JOIN Employee e ON p.UserID = e.UserID
                   WHERE MONTH(p.PayPeriodEnd) = ? AND YEAR(p.PayPeriodEnd) = ?";
    $stmt = $conn->prepare($payrollSql);
    $stmt->bind_param("ii", $month, $year);
    $stmt->execute();
    $payrollResult = $stmt->get_result();
    $payrolls = [];
    while ($row = $payrollResult->fetch_assoc()) {
        $payrolls[] = $row;
    }

    // Fetch Attendance Data (Restored)
    $attendanceSql = "SELECT WorkDate, 
                             SUM(CASE WHEN Status = 'Present' THEN 1 ELSE 0 END) as present,
                             SUM(CASE WHEN Status = 'On Leave' THEN 1 ELSE 0 END) as on_leave,
                             SUM(CASE WHEN Status = 'Absent' THEN 1 ELSE 0 END) as absent
                      FROM Attendance
                      WHERE MONTH(WorkDate) = ? AND YEAR(WorkDate) = ?
                      GROUP BY WorkDate";
    $attStmt = $conn->prepare($attendanceSql);
    $attStmt->bind_param("ii", $month, $year);
    $attStmt->execute();
    $attendanceResult = $attStmt->get_result();
    $attendance = [];
    while ($row = $attendanceResult->fetch_assoc()) {
        // Calculate week number relative to the start of the month
        $weekNum = "Week " . (intval(date('W', strtotime($row['WorkDate']))) - intval(date('W', strtotime("$year-$month-01"))) + 1);
        if (!isset($attendance[$weekNum])) {
            $attendance[$weekNum] = ['name' => $weekNum, 'present' => 0, 'on_leave' => 0, 'absent' => 0];
        }
        $attendance[$weekNum]['present'] += $row['present'];
        $attendance[$weekNum]['on_leave'] += $row['on_leave'];
        $attendance[$weekNum]['absent'] += $row['absent'];
    }

    // Fetch Leave Data for Trends
    $leaveSql = "SELECT LeaveType, StartDate, EndDate 
                 FROM LeaveApplication 
                 WHERE Status = 'Approved' 
                 AND (
                    (MONTH(StartDate) = ? AND YEAR(StartDate) = ?) OR 
                    (MONTH(EndDate) = ? AND YEAR(EndDate) = ?)
                 )";
    $leaveStmt = $conn->prepare($leaveSql);
    $leaveStmt->bind_param("iiii", $month, $year, $month, $year);
    $leaveStmt->execute();
    $leaveResult = $leaveStmt->get_result();

    $leaveTrends = [];
    $totalLeaveDays = 0;

    // Initialize weeks
    $numWeeks = 5; // Approx
    for ($i = 1; $i <= $numWeeks; $i++) {
        $weekKey = "Week $i";
        $leaveTrends[$weekKey] = ['name' => $weekKey, 'Annual' => 0, 'Sick' => 0, 'Unpaid' => 0, 'Other' => 0];
    }

    $monthStart = strtotime("$year-$month-01");
    $monthEnd = strtotime(date("Y-m-t", $monthStart));

    while ($row = $leaveResult->fetch_assoc()) {
        $start = strtotime($row['StartDate']);
        $end = strtotime($row['EndDate']);
        $type = $row['LeaveType'];

        // Iterate through each day of the leave
        for ($current = $start; $current <= $end; $current += 86400) {
            // Check if day is in current month
            if ($current >= $monthStart && $current <= $monthEnd) {
                // Determine week number relative to month
                $dayOfMonth = date('j', $current);
                $weekNum = ceil($dayOfMonth / 7);
                $weekKey = "Week $weekNum";

                if (isset($leaveTrends[$weekKey])) {
                    $leaveTrends[$weekKey][$type]++;
                }
                $totalLeaveDays++;
            }
        }
    }

    // Clean up empty weeks if any (optional, but keeping 5 is safe)
    // Filter out weeks with no data if desired, but fixed 1-5 is better for charts

    if ($format == 'csv') {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="monthly_report_' . $year . '_' . $month . '.csv"');

        $output = fopen('php://output', 'w');

        // Payroll Data
        fputcsv($output, ['Payroll Report']);
        fputcsv($output, ['Employee', 'Total Hours', 'Gross Pay', 'Deductions', 'Net Pay']);
        foreach ($payrolls as $row) {
            fputcsv($output, $row);
        }

        // Attendance Data
        fputcsv($output, []); // Spacer
        fputcsv($output, ['Attendance Report']);
        fputcsv($output, ['Week', 'Present', 'On Leave', 'Absent']);
        foreach ($attendance as $row) {
            fputcsv($output, $row);
        }

        // Leave Data
        fputcsv($output, []); // Spacer
        fputcsv($output, ['Leave Trends Report']);
        fputcsv($output, ['Week', 'Annual', 'Sick', 'Unpaid', 'Other']);
        foreach ($leaveTrends as $row) {
            fputcsv($output, $row);
        }

        fclose($output);
        exit;

    } else { // JSON format
        // Ensure strictly JSON output
        header('Content-Type: application/json');
        error_reporting(0); // Suppress warnings preventing invalid JSON
        // Add json debug output
        // echo json_encode(["debug" => "json output"]); // Example debug output, uncomment to use

        $totalCost = array_sum(array_column($payrolls, 'NetPay'));
        $totalPresent = array_sum(array_column($attendance, 'present'));
        $totalDays = count($attendance) > 0 ? ($totalPresent + array_sum(array_column($attendance, 'on_leave')) + array_sum(array_column($attendance, 'absent'))) : 1;

        $costsPerWeek = [];
        $weekCount = count($attendance);
        foreach ($attendance as $week => $data) {
            $costsPerWeek[] = ['name' => $week, 'cost' => $weekCount > 0 ? $totalCost / $weekCount : 0];
        }

        echo json_encode([
            "status" => "success",
            "data" => [
                "attendance" => array_values($attendance),
                "costs" => $costsPerWeek,
                "leaves" => array_values($leaveTrends),
                "stats" => [
                    "avgAttendance" => ($totalDays > 0 ? round(($totalPresent / $totalDays) * 100, 1) : 0) . '%',
                    "totalCost" => 'RM ' . number_format($totalCost, 2),
                    "totalLeaveDays" => $totalLeaveDays
                ]
            ]
        ]);
    }

} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid action."]);
}

$conn->close();
?>
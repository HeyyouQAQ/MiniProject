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
    while($row = $payrollResult->fetch_assoc()) {
        $payrolls[] = $row;
    }

    // Fetch Attendance Data
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
    while($row = $attendanceResult->fetch_assoc()) {
        $weekNum = "Week " . (intval(date('W', strtotime($row['WorkDate']))) - intval(date('W', strtotime("$year-$month-01"))) + 1);
        if (!isset($attendance[$weekNum])) {
            $attendance[$weekNum] = ['name' => $weekNum, 'present' => 0, 'on_leave' => 0, 'absent' => 0];
        }
        $attendance[$weekNum]['present'] += $row['present'];
        $attendance[$weekNum]['on_leave'] += $row['on_leave'];
        $attendance[$weekNum]['absent'] += $row['absent'];
    }
    
    if ($format == 'csv') {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="monthly_report_'.$year.'_'.$month.'.csv"');
        
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
        
        fclose($output);
        exit;

    } else { // JSON format
        $totalCost = array_sum(array_column($payrolls, 'NetPay'));
        $totalPresent = array_sum(array_column($attendance, 'present'));
        $totalDays = count($attendance) > 0 ? ($totalPresent + array_sum(array_column($attendance, 'on_leave')) + array_sum(array_column($attendance, 'absent'))) : 1;
        
        $costsPerWeek = [];
        // Simplified cost per week - for real-world, this would be more complex
        foreach ($attendance as $week => $data) {
            $costsPerWeek[] = ['name' => $week, 'cost' => $totalCost / count($attendance)];
        }

        echo json_encode([
            "status" => "success",
            "data" => [
                "attendance" => array_values($attendance),
                "costs" => $costsPerWeek,
                "stats" => [
                    "avgAttendance" => ($totalDays > 0 ? round(($totalPresent / $totalDays) * 100, 1) : 0) . '%',
                    "totalCost" => 'RM ' . number_format($totalCost, 2),
                    "productivityScore" => "9.2/10" // Placeholder
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

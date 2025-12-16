<?php
// Suppress PHP errors from being output as HTML
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    require 'db_connect.php';
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database connection failed."]);
    exit;
}

if (!isset($conn) || $conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed."]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method == 'GET') {
    if ($action == 'get_my_payroll') {
        $userId = $_GET['userId'] ?? 0;

        if (empty($userId)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "User ID is required."]);
            exit;
        }

        $month = $_GET['month'] ?? null;
        $year = $_GET['year'] ?? null;

        $sql = "SELECT PayPeriodStart, PayPeriodEnd, TotalHours, GrossPay, Deductions, NetPay, Status FROM Payroll WHERE UserID = ?";

        $params = [$userId];
        $types = "i";

        if ($month && $year) {
            $sql .= " AND MONTH(PayPeriodEnd) = ? AND YEAR(PayPeriodEnd) = ?";
            $params[] = $month;
            $params[] = $year;
            $types .= "ii";
        }

        $sql .= " ORDER BY PayPeriodEnd DESC";

        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();

            $payrolls = [];
            if ($result) {
                while ($row = $result->fetch_assoc()) {
                    $payrolls[] = $row;
                }
            }
            echo json_encode(["status" => "success", "data" => $payrolls]);
        } else {
            echo json_encode(["status" => "error", "message" => "Query failed."]);
        }

    } elseif ($action == 'get_all_payrolls') {
        $sql = "SELECT p.*, e.Name, r.Type as RoleName 
                FROM Payroll p
                JOIN Employee e ON p.UserID = e.UserID
                JOIN Role r ON e.RoleID = r.RoleID
                ORDER BY p.PayPeriodEnd DESC, e.Name ASC";
        $result = $conn->query($sql);
        $payrolls = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $payrolls[] = $row;
            }
        }
        echo json_encode(["status" => "success", "data" => $payrolls]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid GET action."]);
    }
} elseif ($method == 'POST') {
    if ($action == 'generate_payroll') {
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
        if (!is_array($input)) {
            $input = [];
        }

        // Use current month as default if no dates provided
        $startDate = isset($input['startDate']) && !empty($input['startDate']) ? $input['startDate'] : date('Y-m-01');
        $endDate = isset($input['endDate']) && !empty($input['endDate']) ? $input['endDate'] : date('Y-m-t');

        // Get all employees (HourlyRate may not exist, so we use a default)
        $employeesResult = $conn->query("SELECT UserID, Name, RoleID FROM Employee");

        if (!$employeesResult) {
            echo json_encode(["status" => "error", "message" => "Failed to fetch employees: " . $conn->error]);
            exit;
        }

        $employees = [];
        while ($row = $employeesResult->fetch_assoc()) {
            $employees[] = $row;
        }

        if (count($employees) == 0) {
            echo json_encode(["status" => "success", "message" => "No employees found.", "data" => []]);
            exit;
        }

        $generatedPayrolls = [];

        foreach ($employees as $employee) {
            $userId = $employee['UserID'];

            // Get hourly rate from SystemConfiguration or use default
            $defaultHourlyRate = 15; // Default RM15/hour
            $rateResult = $conn->query("SELECT DefaultHourlyRate FROM SystemConfiguration LIMIT 1");
            if ($rateResult && $rateRow = $rateResult->fetch_assoc()) {
                if (isset($rateRow['DefaultHourlyRate']) && $rateRow['DefaultHourlyRate'] > 0) {
                    $defaultHourlyRate = floatval($rateRow['DefaultHourlyRate']);
                }
            }
            $hourlyRate = $defaultHourlyRate;

            // Calculate total hours, OT, and deductions daily
            $attendanceStmt = $conn->prepare("SELECT WorkDate, ClockInTime, ClockOutTime FROM Attendance WHERE UserID = ? AND WorkDate BETWEEN ? AND ? AND ClockInTime IS NOT NULL AND ClockOutTime IS NOT NULL");

            $totalNormalHours = 0;
            $totalOTHours = 0;
            $totalLateHours = 0;
            $totalEarlyHours = 0;
            $daysPresent = 0;

            // Shift Settings
            $shiftStartResult = $conn->query("SELECT Value FROM SystemConfiguration WHERE KeyName = 'ShiftStartTime' LIMIT 1");
            $shiftEndResult = $conn->query("SELECT Value FROM SystemConfiguration WHERE KeyName = 'ShiftEndTime' LIMIT 1");
            // Defaults as requested: 9am - 6:30pm
            $shiftStartStr = '09:00:00';
            $shiftEndStr = '18:30:00';

            if ($attendanceStmt) {
                $attendanceStmt->bind_param("iss", $userId, $startDate, $endDate);
                $attendanceStmt->execute();
                $attResult = $attendanceStmt->get_result();

                while ($row = $attResult->fetch_assoc()) {
                    $daysPresent++;
                    $date = $row['WorkDate'];
                    $clockIn = strtotime($row['ClockInTime']);
                    $clockOut = strtotime($row['ClockOutTime']);

                    $shiftStart = strtotime("$date $shiftStartStr");
                    $shiftEnd = strtotime("$date $shiftEndStr");

                    // Late Arrival
                    if ($clockIn > $shiftStart) {
                        $totalLateHours += ($clockIn - $shiftStart) / 3600;
                    }

                    // Early Departure (before shift end)
                    if ($clockOut < $shiftEnd) {
                        $totalEarlyHours += ($shiftEnd - $clockOut) / 3600;
                    }

                    // Overtime (after shift end)
                    if ($clockOut > $shiftEnd) {
                        $totalOTHours += ($clockOut - $shiftEnd) / 3600;
                    }

                    // Actual Worked Hours (Simple duration for record keeping)
                    $totalNormalHours += ($clockOut - $clockIn) / 3600;
                }
            }

            // Calculate Totals based on "7 days a week work" expectation
            // 1. Calculate Expected Days
            $startDT = new DateTime($startDate);
            $endDT = new DateTime($endDate);
            $daysInPeriod = $endDT->diff($startDT)->days + 1;

            // Expected Daily Hours (9am to 6:30pm = 9.5 hours)
            $dailyHours = 9.5;

            // Deduct Absences
            $absentDays = $daysInPeriod - $daysPresent;
            // Ensure strictly positive (in case of data anomalies)
            if ($absentDays < 0)
                $absentDays = 0;

            $absentHours = $absentDays * $dailyHours;

            // Calculations
            // Gross Pay = (Total Expected Hours * Rate) + (OT * Rate * 1.5)
            // Expectation: Every day, 9.5 hours.
            $expectedHours = $daysInPeriod * $dailyHours;
            $baseGross = $expectedHours * $hourlyRate;
            $otPay = $totalOTHours * $hourlyRate * 1.5;

            $grossPay = $baseGross + $otPay;

            // Deductions = (Absent + Late + Early) * Rate
            $deductions = ($absentHours + $totalLateHours + $totalEarlyHours) * $hourlyRate;

            // Net Pay
            $netPay = $grossPay - $deductions;

            // For display: TotalHours = Actual Normal + OT
            $totalHours = $totalNormalHours + $totalOTHours;


            // Get role name
            $roleName = 'Staff';
            if (!empty($employee['RoleID'])) {
                $roleQuery = $conn->query("SELECT Type FROM Role WHERE RoleID = " . intval($employee['RoleID']));
                if ($roleQuery && $roleRow = $roleQuery->fetch_assoc()) {
                    $roleName = $roleRow['Type'];
                }
            }

            $generatedPayrolls[] = [
                'Name' => $employee['Name'],
                'RoleName' => $roleName,
                'TotalHours' => $totalHours,
                'GrossPay' => $grossPay,
                'Deductions' => $deductions,
                'NetPay' => $netPay
            ];

            // SAVE TO DATABASE
            // Check if record exists for this period
            $checkStmt = $conn->prepare("SELECT PayrollID FROM Payroll WHERE UserID = ? AND PayPeriodStart = ? AND PayPeriodEnd = ?");
            $checkStmt->bind_param("iss", $userId, $startDate, $endDate);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();

            if ($checkResult->num_rows == 0) {
                // Insert new record
                $status = 'Generated';
                $insertStmt = $conn->prepare("INSERT INTO Payroll (UserID, PayPeriodStart, PayPeriodEnd, TotalHours, GrossPay, Deductions, NetPay, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $insertStmt->bind_param("issdddds", $userId, $startDate, $endDate, $totalHours, $grossPay, $deductions, $netPay, $status);
                $insertStmt->execute();
            } else {
                // Update existing record with recalculations
                $existing = $checkResult->fetch_assoc();
                $payrollID = $existing['PayrollID'];

                // Only update if not 'Paid'? Usually yes, but for this project we might want to force update.
                // Converting numeric values for update
                $updateStmt = $conn->prepare("UPDATE Payroll SET TotalHours = ?, GrossPay = ?, Deductions = ?, NetPay = ? WHERE PayrollID = ?");
                $updateStmt->bind_param("ddddi", $totalHours, $grossPay, $deductions, $netPay, $payrollID);
                $updateStmt->execute();
            }
        }

        echo json_encode(["status" => "success", "message" => "Payroll generated and saved successfully.", "data" => $generatedPayrolls]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid POST action."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
}

$conn->close();
?>
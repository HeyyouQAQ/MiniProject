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

        $stmt = $conn->prepare("SELECT PayPeriodStart, PayPeriodEnd, TotalHours, GrossPay, Deductions, NetPay, Status FROM Payroll WHERE UserID = ? ORDER BY PayPeriodEnd DESC");
        if ($stmt) {
            $stmt->bind_param("i", $userId);
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

            // Calculate total hours from attendance (using minutes for precision)
            $hoursStmt = $conn->prepare("SELECT SUM(TIMESTAMPDIFF(MINUTE, ClockInTime, ClockOutTime)) as TotalMinutes 
                                         FROM Attendance 
                                         WHERE UserID = ? AND WorkDate BETWEEN ? AND ? AND ClockInTime IS NOT NULL AND ClockOutTime IS NOT NULL");

            if (!$hoursStmt) {
                continue; // Skip this employee if query fails
            }

            $hoursStmt->bind_param("iss", $userId, $startDate, $endDate);
            $hoursStmt->execute();
            $hoursResult = $hoursStmt->get_result()->fetch_assoc();
            $totalMinutes = $hoursResult['TotalMinutes'] ?? 0;
            $totalHours = round($totalMinutes / 60, 2);

            // Include employees even with 0 hours
            $grossPay = $totalHours * $hourlyRate;
            $deductions = 0;
            $netPay = $grossPay - $deductions;

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
        }

        echo json_encode(["status" => "success", "message" => "Payroll generated successfully.", "data" => $generatedPayrolls]);
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
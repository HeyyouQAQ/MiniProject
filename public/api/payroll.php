<?php
/*
    Payroll API
    - Handled by db_connect.php: Headers, CORS, OPTIONS request, DB Connection
*/

// Suppress errors to ensure clean JSON output
error_reporting(0);
ini_set('display_errors', 0);

require 'db_connect.php';

// At this point, $conn is available and headers are set.
// Double check connection just in case db_connect.php logic changes
if (!isset($conn) || $conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed."]);
    exit;
}

header('Content-Type: application/json'); // db_connect doesn't set Content-Type explicitly often, good to keep or check.
// Checking db_connect.php content from previous step:
// It sets Access-Control items. It does NOT set Content-Type: application/json.
// So we MUST set Content-Type.


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
                // Formatting role name for frontend (optional, though frontend handles mapping too)
                if (strtolower($row['RoleName']) == 'worker') {
                    $row['RoleName'] = 'Staff';
                }
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
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) {
            $input = [];
        }

        // Use current month as default if no dates provided
        $startDate = isset($input['startDate']) && !empty($input['startDate']) ? $input['startDate'] : date('Y-m-01');
        $endDate = isset($input['endDate']) && !empty($input['endDate']) ? $input['endDate'] : date('Y-m-t');

        // Get all employees
        $employeesResult = $conn->query("SELECT UserID, Name, HourlyRate, RoleID FROM Employee");

        if (!$employeesResult) {
            echo json_encode(["status" => "error", "message" => "Failed to fetch employees: " . $conn->error]);
            exit;
        }

        $employees = [];
        while ($row = $employeesResult->fetch_assoc()) {
            $employees[] = $row;
        }

        $generatedPayrolls = [];
        $idsToDelete = [];

        // Clean up previous payrolls for this period (optional, or we can just upsert. But simple delete/insert is easier)
        // For simplicity, we just insert. Duplicate checks might be needed in production.
        
        foreach ($employees as $employee) {
            $userId = $employee['UserID'];

            // Get hourly rate - try Employee specific rate first, then default
            $hourlyRate = isset($employee['HourlyRate']) ? floatval($employee['HourlyRate']) : 15.00;
            if ($hourlyRate <= 0) {
                 // Fallback to system config if needed (or just keep 15 as hard fallback)
                 $hourlyRate = 15.00; 
            }

            // Calculate total hours from attendance (using minutes for precision)
            $hoursStmt = $conn->prepare("SELECT SUM(TIMESTAMPDIFF(MINUTE, ClockInTime, ClockOutTime)) as TotalMinutes 
                                         FROM Attendance 
                                         WHERE UserID = ? AND WorkDate BETWEEN ? AND ? AND ClockInTime IS NOT NULL AND ClockOutTime IS NOT NULL");
            
            if (!$hoursStmt) continue;

            $hoursStmt->bind_param("iss", $userId, $startDate, $endDate);
            $hoursStmt->execute();
            $hoursResult = $hoursStmt->get_result()->fetch_assoc();
            $totalMinutes = $hoursResult['TotalMinutes'] ?? 0;
            $totalHours = round($totalMinutes / 60, 2);

            // Logic: Generate payroll entry even if 0 hours? Yes, showing 0 pay.
            $grossPay = $totalHours * $hourlyRate;
            $deductions = 0; // Placeholder
            $netPay = $grossPay - $deductions;

            // Delete existing payroll for this user and period to avoid duplicates (Simple approach)
            $deleteStmt = $conn->prepare("DELETE FROM Payroll WHERE UserID = ? AND PayPeriodStart = ? AND PayPeriodEnd = ?");
            $deleteStmt->bind_param("iss", $userId, $startDate, $endDate);
            $deleteStmt->execute();

            // Insert new record
            $insertStmt = $conn->prepare("INSERT INTO Payroll (UserID, PayPeriodStart, PayPeriodEnd, TotalHours, GrossPay, Deductions, NetPay, Status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Generated')");
            $insertStmt->bind_param("issdddd", $userId, $startDate, $endDate, $totalHours, $grossPay, $deductions, $netPay);
            $insertStmt->execute();

            // Fetch Role Name for response
            $roleName = 'Staff';
            if ($employee['RoleID']) {
                $roleResult = $conn->query("SELECT Type FROM Role WHERE RoleID = " . intval($employee['RoleID']));
                if ($roleResult && $r = $roleResult->fetch_assoc()) {
                     $roleName = $r['Type'];
                }
            }
            // Map Worker -> Staff for consistency
            if (strtolower($roleName) == 'worker') $roleName = 'Staff';

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

<?php
require 'db_connect.php';

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

    } elseif ($action == 'get_all_payrolls') {
        $sql = "SELECT p.*, e.Name, r.Type as RoleName 
                FROM Payroll p
                JOIN Employee e ON p.UserID = e.UserID
                JOIN Role r ON e.RoleID = r.RoleID
                ORDER BY p.PayPeriodEnd DESC, e.Name ASC";
        $result = $conn->query($sql);
        $payrolls = [];
        if ($result) {
            while($row = $result->fetch_assoc()) {
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
        $startDate = $input['startDate'] ?? '';
        $endDate = $input['endDate'] ?? '';

        if (empty($startDate) || empty($endDate)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Start date and end date are required."]);
            exit;
        }

        // Get all employees
        $employeesResult = $conn->query("SELECT UserID, Name, HourlyRate, RoleID FROM Employee");
        $employees = [];
        while ($row = $employeesResult->fetch_assoc()) {
            $employees[] = $row;
        }

        $generatedPayrolls = [];

        foreach ($employees as $employee) {
            $userId = $employee['UserID'];

            // Calculate total hours from attendance (using minutes for precision)
            $hoursStmt = $conn->prepare("SELECT SUM(TIMESTAMPDIFF(MINUTE, ClockInTime, ClockOutTime)) as TotalMinutes 
                                         FROM Attendance 
                                         WHERE UserID = ? AND WorkDate BETWEEN ? AND ? AND ClockInTime IS NOT NULL AND ClockOutTime IS NOT NULL");
            $hoursStmt->bind_param("iss", $userId, $startDate, $endDate);
            $hoursStmt->execute();
            $hoursResult = $hoursStmt->get_result()->fetch_assoc();
            $totalMinutes = $hoursResult['TotalMinutes'] ?? 0;
            $totalHours = round($totalMinutes / 60, 2);

            if ($totalHours > 0) {
                $grossPay = $totalHours * $employee['HourlyRate'];
                $deductions = 0; // Placeholder for deductions logic
                $netPay = $grossPay - $deductions;

                $insertStmt = $conn->prepare("INSERT INTO Payroll (UserID, PayPeriodStart, PayPeriodEnd, TotalHours, GrossPay, Deductions, NetPay) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $insertStmt->bind_param("issdddd", $userId, $startDate, $endDate, $totalHours, $grossPay, $deductions, $netPay);
                $insertStmt->execute();

                $roleResult = $conn->query("SELECT Type FROM Role WHERE RoleID = " . $employee['RoleID'])->fetch_assoc();

                $generatedPayrolls[] = [
                    'Name' => $employee['Name'],
                    'RoleName' => $roleResult['Type'],
                    'TotalHours' => $totalHours,
                    'GrossPay' => $grossPay,
                    'Deductions' => $deductions,
                    'NetPay' => $netPay
                ];
            }
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

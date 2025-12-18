<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

// Basic session/auth check (simulated or real)
// In a real app, you'd check $_SESSION['user_id'] and $_SESSION['role']
// For this project, we assume the frontend sends role/userId in headers or we trust the request for now,
// BUT the requirements say:
// - HR can only modify Staff
// - Manager can modify Staff and HR
// We will implement this logic.

// Helper to send error
function sendError($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['status' => 'error', 'message' => $msg]);
    exit();
}

// Get Input
$input = json_decode(file_get_contents('php://input'), true);
$method = $_SERVER['REQUEST_METHOD'];

// We need to know who is making the request.
// For now, we'll look for a 'Requester-Role' and 'Requester-ID' header or query param if not using sessions.
// Let's assume the frontend sends these.
$requesterRole = $_SERVER['HTTP_X_REQUESTER_ROLE'] ?? $_GET['requester_role'] ?? '';
$requesterId = $_SERVER['HTTP_X_REQUESTER_ID'] ?? $_GET['requester_id'] ?? 0;

// Debug Logging
$logMsg = date('Y-m-d H:i:s') . " | Method: $method | Role: '$requesterRole' | ID: '$requesterId' | GET: " . json_encode($_GET) . "\n";
file_put_contents('debug_salary_log.txt', $logMsg, FILE_APPEND);

if ($method === 'GET') {
    // Fetch logic
    // Mode 1: List all employees (with filter)
    // Mode 2: Get specific employee details

    $targetUserId = $_GET['user_id'] ?? null;

    if ($targetUserId) {
        // Fetch specific
        $stmt = $conn->prepare("
            SELECT 
                e.UserID, e.Name as FullName, e.Email, r.Type as Role,
                s.SetupID, s.BasicSalary, s.SalaryPerHour, s.FixedAllowance,
                s.BankName, s.BankAccountNumber, s.EPF_Account_No, s.Tax_Account_No,
                s.DefaultSpecialLeaveDays
            FROM Employee e
            JOIN Role r ON e.RoleID = r.RoleID
            LEFT JOIN EmployeeSalarySetup s ON e.UserID = s.UserID
            WHERE e.UserID = ?
        ");
        $stmt->bind_param("i", $targetUserId);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_assoc();

        if (!$data) {
            sendError('User not found', 404);
        }

        // Permission Check
        if ($requesterRole === 'HR' && $data['Role'] !== 'Staff') {
            sendError('Access Denied: HR can only view Staff profiles.', 403);
        }

        echo json_encode(['status' => 'success', 'data' => $data]);

    } else {
        // List all relevant employees
        // Manager -> All (Staff, HR)
        // HR -> Staff only

        $query = "
            SELECT 
                e.UserID, e.Name as FullName, e.Email, r.Type as Role,
                s.SetupID, s.BasicSalary
            FROM Employee e
            JOIN Role r ON e.RoleID = r.RoleID
            LEFT JOIN EmployeeSalarySetup s ON e.UserID = s.UserID
            WHERE 1=1
        ";

        if ($requesterRole === 'HR') {
            $query .= " AND r.Type = 'Staff'";
        } else if ($requesterRole === 'Manager') {
            // Manager sees Staff and HR. 
            // Usually Manager shouldn't see other Managers' salary? 
            // Requirement: "manager can manage staff and hr information"
            $query .= " AND r.Type IN ('Staff', 'HR')";
        } else {
            // Fallback or deny
             // sendError('Invalid Role', 403); 
             // For dev, maybe allow listing all if no role specified? No, safer to return empty.
             if (empty($requesterRole)) {
                 $query .= " AND 0"; 
             }
        }

        $result = $conn->query($query);
        $employees = [];
        while ($row = $result->fetch_assoc()) {
            $employees[] = $row;
        }

        echo json_encode(['status' => 'success', 'data' => $employees]);
    }

} elseif ($method === 'POST') {
    // Update/Create logic
    if (!$input) {
        sendError('Invalid input');
    }

    $targetUserId = $input['user_id'] ?? null;
    if (!$targetUserId) {
        sendError('User ID required');
    }

    // Check target user role
    $stmt = $conn->prepare("SELECT r.Type as Role FROM Employee e JOIN Role r ON e.RoleID = r.RoleID WHERE e.UserID = ?");
    $stmt->bind_param("i", $targetUserId);
    $stmt->execute();
    $res = $stmt->get_result();
    $targetUser = $res->fetch_assoc();

    if (!$targetUser) {
        sendError('Target user not found', 404);
    }

    // Permission Check
    if ($requesterRole === 'HR' && $targetUser['Role'] !== 'Staff') {
        sendError('Access Denied: HR can only modify Staff profiles.', 403);
    }
    if ($requesterRole === 'Manager' && !in_array($targetUser['Role'], ['Staff', 'HR'])) {
         sendError('Access Denied: Manager can only modify Staff and HR profiles.', 403);
    }

    // Upsert logic
    // Check if setup exists
    $checkStmt = $conn->prepare("SELECT SetupID FROM EmployeeSalarySetup WHERE UserID = ?");
    $checkStmt->bind_param("i", $targetUserId);
    $checkStmt->execute();
    $exists = $checkStmt->get_result()->fetch_assoc();

    $basicSalary = $input['basic_salary'] ?? 0.00;
    $salaryPerHour = $input['salary_per_hour'] ?? 0.00;
    $fixedAllowance = $input['fixed_allowance'] ?? 0.00;
    $bankName = $input['bank_name'] ?? '';
    $bankAccountNumber = $input['bank_account_number'] ?? '';
    $epfAccountNo = $input['epf_account_no'] ?? '';
    $taxAccountNo = $input['tax_account_no'] ?? '';
    $defaultSpecialLeaveDays = $input['default_special_leave_days'] ?? 0;
    $updaterId = $requesterId;

    if ($exists) {
        // Update
        $updateStmt = $conn->prepare("
            UPDATE EmployeeSalarySetup SET
                BasicSalary = ?,
                SalaryPerHour = ?,
                FixedAllowance = ?,
                BankName = ?,
                BankAccountNumber = ?,
                EPF_Account_No = ?,
                Tax_Account_No = ?,
                DefaultSpecialLeaveDays = ?,
                LastUpdatedBy = ?
            WHERE UserID = ?
        ");
        $updateStmt->bind_param("dddssssiii", 
            $basicSalary, $salaryPerHour, $fixedAllowance, 
            $bankName, $bankAccountNumber, $epfAccountNo, $taxAccountNo, 
            $defaultSpecialLeaveDays, $updaterId, $targetUserId
        );
        
        if ($updateStmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Profile updated successfully']);
        } else {
            sendError('Update failed: ' . $conn->error);
        }

    } else {
        // Insert
        $insertStmt = $conn->prepare("
            INSERT INTO EmployeeSalarySetup (
                UserID, BasicSalary, SalaryPerHour, FixedAllowance, 
                BankName, BankAccountNumber, EPF_Account_No, Tax_Account_No, 
                DefaultSpecialLeaveDays, LastUpdatedBy
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $insertStmt->bind_param("idddssssii", 
            $targetUserId, $basicSalary, $salaryPerHour, $fixedAllowance, 
            $bankName, $bankAccountNumber, $epfAccountNo, $taxAccountNo, 
            $defaultSpecialLeaveDays, $updaterId
        );

        if ($insertStmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Profile created successfully']);
        } else {
            sendError('Insert failed: ' . $conn->error);
        }
    }

} else {
    sendError('Method not allowed', 405);
}
?>

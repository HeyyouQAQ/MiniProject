<?php
require 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method == 'GET') {
    if ($action == 'list_pending') {
        $sql = "SELECT la.LeaveID, e.Name, la.LeaveType, la.StartDate, la.EndDate, la.Reason, la.Status, la.AttachmentPath
                FROM LeaveApplication la
                JOIN Employee e ON la.UserID = e.UserID
                ORDER BY la.StartDate DESC";
        $result = $conn->query($sql);
        $requests = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $requests[] = $row;
            }
        }
        echo json_encode(["status" => "success", "data" => $requests]);
    } elseif ($action == 'my_leaves') {
        $userId = $_GET['userId'] ?? 0;
        if (empty($userId)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "User ID required."]);
            exit;
        }
        $stmt = $conn->prepare("SELECT LeaveType, StartDate, EndDate, Reason, Status, AttachmentPath FROM LeaveApplication WHERE UserID = ? ORDER BY StartDate DESC");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $requests = [];
        while ($row = $result->fetch_assoc()) {
            $requests[] = $row;
        }
        echo json_encode(["status" => "success", "data" => $requests]);
    } elseif ($action == 'leave_balance') {
        // Get leave balance for a user
        $userId = $_GET['userId'] ?? 0;
        if (empty($userId)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "User ID required."]);
            exit;
        }

        // Get default annual leave days from SystemConfiguration
        $defaultAnnualDays = 15;
        $sickDays = 14; // Default sick leave days
        $confRes = $conn->query("SELECT DefaultAnnualLeaveDays FROM SystemConfiguration LIMIT 1");
        if ($confRes && $row = $confRes->fetch_assoc()) {
            $defaultAnnualDays = intval($row['DefaultAnnualLeaveDays']);
        }

        // Get current year
        $currentYear = date('Y');
        $yearStart = $currentYear . '-01-01';
        $yearEnd = $currentYear . '-12-31';

        // Calculate used leave days per type (only approved leaves)
        $stmt = $conn->prepare("
            SELECT LeaveType, 
                   SUM(DATEDIFF(EndDate, StartDate) + 1) as DaysUsed
            FROM LeaveApplication 
            WHERE UserID = ? 
              AND Status = 'Approved'
              AND StartDate >= ?
              AND StartDate <= ?
            GROUP BY LeaveType
        ");
        $stmt->bind_param("iss", $userId, $yearStart, $yearEnd);
        $stmt->execute();
        $result = $stmt->get_result();

        $usedDays = [
            'Annual' => 0,
            'Sick' => 0,
            'Unpaid' => 0,
            'Other' => 0
        ];

        while ($row = $result->fetch_assoc()) {
            $usedDays[$row['LeaveType']] = intval($row['DaysUsed']);
        }

        // Calculate pending days (for awareness)
        $stmtPending = $conn->prepare("
            SELECT LeaveType, 
                   SUM(DATEDIFF(EndDate, StartDate) + 1) as DaysPending
            FROM LeaveApplication 
            WHERE UserID = ? 
              AND Status = 'Pending'
              AND StartDate >= ?
              AND StartDate <= ?
            GROUP BY LeaveType
        ");
        $stmtPending->bind_param("iss", $userId, $yearStart, $yearEnd);
        $stmtPending->execute();
        $pendingResult = $stmtPending->get_result();

        $pendingDays = [
            'Annual' => 0,
            'Sick' => 0,
            'Unpaid' => 0,
            'Other' => 0
        ];

        while ($row = $pendingResult->fetch_assoc()) {
            $pendingDays[$row['LeaveType']] = intval($row['DaysPending']);
        }

        $balance = [
            'annual' => [
                'total' => $defaultAnnualDays,
                'used' => $usedDays['Annual'],
                'pending' => $pendingDays['Annual'],
                'remaining' => $defaultAnnualDays - $usedDays['Annual']
            ],
            'sick' => [
                'total' => $sickDays,
                'used' => $usedDays['Sick'],
                'pending' => $pendingDays['Sick'],
                'remaining' => $sickDays - $usedDays['Sick']
            ],
            'unpaid' => [
                'total' => null, // No limit
                'used' => $usedDays['Unpaid'],
                'pending' => $pendingDays['Unpaid'],
                'remaining' => null
            ],
            'other' => [
                'total' => null, // No limit
                'used' => $usedDays['Other'],
                'pending' => $pendingDays['Other'],
                'remaining' => null
            ]
        ];

        echo json_encode(["status" => "success", "data" => $balance]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid GET action."]);
    }
} elseif ($method == 'POST') {
    if ($action == 'apply') {
        // Handle both JSON and FormData
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (strpos($contentType, 'multipart/form-data') !== false) {
            // FormData with file upload
            $userId = $_POST['userId'] ?? 0;
            $leaveType = $_POST['leaveType'] ?? '';
            $startDate = $_POST['startDate'] ?? '';
            $endDate = $_POST['endDate'] ?? '';
            $reason = $_POST['reason'] ?? '';
        } else {
            // JSON input
            $input = json_decode(file_get_contents('php://input'), true);
            $userId = $input['userId'] ?? 0;
            $leaveType = $input['leaveType'] ?? '';
            $startDate = $input['startDate'] ?? '';
            $endDate = $input['endDate'] ?? '';
            $reason = $input['reason'] ?? '';
        }

        if (empty($userId) || empty($leaveType) || empty($startDate) || empty($endDate) || empty($reason)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "All fields are required."]);
            exit;
        }

        $attachmentPath = null;

        // Handle file upload if present
        if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/uploads/leave_docs/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $fileName = $_FILES['attachment']['name'];
            $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];

            if (!in_array($fileExt, $allowedTypes)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid file type. Allowed: PDF, JPG, PNG, GIF"]);
                exit;
            }

            // Generate unique filename
            $newFileName = 'leave_' . $userId . '_' . time() . '.' . $fileExt;
            $targetPath = $uploadDir . $newFileName;

            if (move_uploaded_file($_FILES['attachment']['tmp_name'], $targetPath)) {
                $attachmentPath = 'api/uploads/leave_docs/' . $newFileName;
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to upload file."]);
                exit;
            }
        }

        $stmt = $conn->prepare("INSERT INTO LeaveApplication (UserID, LeaveType, StartDate, EndDate, Reason, AttachmentPath) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssss", $userId, $leaveType, $startDate, $endDate, $reason, $attachmentPath);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Leave application submitted successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to submit leave application."]);
        }
    } elseif ($action == 'update_status') {
        $input = json_decode(file_get_contents('php://input'), true);
        $leaveId = $input['leaveId'] ?? 0;
        $status = $input['status'] ?? '';
        $reviewedBy = $input['reviewedBy'] ?? 0;

        if (empty($leaveId) || empty($status) || empty($reviewedBy)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Leave ID, status, and reviewer ID are required."]);
            exit;
        }

        $stmt = $conn->prepare("UPDATE LeaveApplication SET Status = ?, ReviewedBy = ? WHERE LeaveID = ?");
        $stmt->bind_param("sii", $status, $reviewedBy, $leaveId);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Leave status updated successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to update leave status."]);
        }
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

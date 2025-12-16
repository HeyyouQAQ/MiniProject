<?php
require 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method == 'GET') {
    if ($action == 'list_pending') {
        $sql = "SELECT la.LeaveID, e.Name, la.LeaveType, la.StartDate, la.EndDate, la.Reason, la.Status, la.AttachmentPath
                FROM LeaveApplication la
                JOIN Employee e ON la.UserID = e.UserID
                ORDER BY la.StartDate ASC";
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

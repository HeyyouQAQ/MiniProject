<?php
require 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method == 'GET') {
    if ($action == 'list_pending') {
        $sql = "SELECT la.LeaveID, e.Name, la.LeaveType, la.StartDate, la.EndDate, la.Reason, la.Status
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
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid GET action."]);
    }
} elseif ($method == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action == 'apply') {
        $userId = $input['userId'] ?? 0;
        $leaveType = $input['leaveType'] ?? '';
        $startDate = $input['startDate'] ?? '';
        $endDate = $input['endDate'] ?? '';
        $reason = $input['reason'] ?? '';

        if (empty($userId) || empty($leaveType) || empty($startDate) || empty($endDate) || empty($reason)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "All fields are required."]);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO LeaveApplication (UserID, LeaveType, StartDate, EndDate, Reason) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("issss", $userId, $leaveType, $startDate, $endDate, $reason);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Leave application submitted successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to submit leave application."]);
        }
    } elseif ($action == 'update_status') {
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

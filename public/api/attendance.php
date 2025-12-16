<?php
require 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Utility function to format time
function format_time($datetime) {
    if (!$datetime) return null;
    return (new DateTime($datetime))->format('h:i:s A');
}

// Utility function to calculate hours
function calculate_hours($clock_in, $clock_out) {
    if (!$clock_in || !$clock_out) return '0h 00m';
    $in = new DateTime($clock_in);
    $out = new DateTime($clock_out);
    $interval = $in->diff($out);
    return $interval->format('%h h %i m');
}

if ($method == 'GET') {
    if ($action == 'status') {
        $userId = $_GET['userId'] ?? 0;
        if (empty($userId)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "User ID is required."]);
            exit;
        }

        $today = date('Y-m-d');
        
        $stmt = $conn->prepare("SELECT ClockInTime, ClockOutTime FROM Attendance WHERE UserID = ? AND WorkDate = ?");
        $stmt->bind_param("is", $userId, $today);
        $stmt->execute();
        $todaysRecord = $stmt->get_result()->fetch_assoc();

        $lastStmt = $conn->prepare("SELECT ClockInTime, ClockOutTime FROM Attendance WHERE UserID = ? AND ClockOutTime IS NOT NULL ORDER BY ClockOutTime DESC LIMIT 1");
        $lastStmt->bind_param("i", $userId);
        $lastStmt->execute();
        $lastRecord = $lastStmt->get_result()->fetch_assoc();
        
        $status = 'clocked-out';
        if ($todaysRecord && $todaysRecord['ClockInTime'] && !$todaysRecord['ClockOutTime']) {
            $status = 'clocked-in';
        }

        echo json_encode([
            "status" => "success",
            "data" => [
                "status" => $status,
                "lastClockIn" => $todaysRecord ? format_time($todaysRecord['ClockInTime']) : null,
                "lastClockOut" => $lastRecord ? format_time($lastRecord['ClockOutTime']) : null,
                "todaysHours" => calculate_hours($todaysRecord['ClockInTime'], $todaysRecord['ClockOutTime'])
            ]
        ]);
    } elseif ($action == 'list_all') {
        $sql = "SELECT a.AttendanceID, a.UserID, e.Name, a.WorkDate, a.ClockInTime, a.ClockOutTime, a.Status
                FROM Attendance a
                JOIN Employee e ON a.UserID = e.UserID
                ORDER BY a.WorkDate DESC, e.Name ASC";
        $result = $conn->query($sql);
        $records = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $records[] = $row;
            }
        }
        echo json_encode(["status" => "success", "data" => $records]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid GET action."]);
    }

} elseif ($method == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action == 'clock_in' || $action == 'clock_out') {
        $userId = $input['userId'] ?? 0;
        if (empty($userId)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "User ID is required."]);
            exit;
        }
        
        $now = date('Y-m-d H:i:s');
        $today = date('Y-m-d');

        $stmt = $conn->prepare("SELECT AttendanceID, ClockInTime, ClockOutTime FROM Attendance WHERE UserID = ? AND WorkDate = ?");
        $stmt->bind_param("is", $userId, $today);
        $stmt->execute();
        $record = $stmt->get_result()->fetch_assoc();

        if ($action == 'clock_in') {
            if ($record) {
                if($record['ClockOutTime']){
                    http_response_code(400);
                    echo json_encode(["status" => "error", "message" => "You have already completed a shift today."]);
                    exit;
                }
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "You have already clocked in today."]);
                exit;
            } else {
                $insertStmt = $conn->prepare("INSERT INTO Attendance (UserID, WorkDate, ClockInTime, Status) VALUES (?, ?, ?, 'Present')");
                $insertStmt->bind_param("iss", $userId, $today, $now);
                if ($insertStmt->execute()) {
                    echo json_encode(["status" => "success", "message" => "Clocked in successfully."]);
                } else {
                    http_response_code(500);
                    echo json_encode(["status" => "error", "message" => "Failed to clock in."]);
                }
            }
        } elseif ($action == 'clock_out') {
            if ($record && $record['ClockInTime'] && !$record['ClockOutTime']) {
                $updateStmt = $conn->prepare("UPDATE Attendance SET ClockOutTime = ? WHERE AttendanceID = ?");
                $updateStmt->bind_param("si", $now, $record['AttendanceID']);
                if ($updateStmt->execute()) {
                    echo json_encode(["status" => "success", "message" => "Clocked out successfully."]);
                } else {
                    http_response_code(500);
                    echo json_encode(["status" => "error", "message" => "Failed to clock out."]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "You must be clocked in to clock out."]);
            }
        }
    } elseif ($action == 'update_record') {
        $attendanceId = $input['attendanceId'] ?? 0;
        $clockIn = $input['clockIn'] ?? null;
        $clockOut = $input['clockOut'] ?? null;
        $overwrittenBy = $input['overwrittenBy'] ?? null;

        if (empty($attendanceId)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Attendance ID is required."]);
            exit;
        }

        $stmt = $conn->prepare("UPDATE Attendance SET ClockInTime = ?, ClockOutTime = ?, OverwrittenBy = ? WHERE AttendanceID = ?");
        $stmt->bind_param("ssii", $clockIn, $clockOut, $overwrittenBy, $attendanceId);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Record updated successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to update record."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid POST action."]);
    }
}

$conn->close();
?>

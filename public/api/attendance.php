<?php
require 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Utility function to format time
<<<<<<< HEAD
function format_time($datetime) {
    if (!$datetime) return null;
=======
function format_time($datetime)
{
    if (!$datetime)
        return null;
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
    return (new DateTime($datetime))->format('h:i:s A');
}

// Utility function to calculate hours
<<<<<<< HEAD
function calculate_hours($clock_in, $clock_out) {
    if (!$clock_in || !$clock_out) return '0h 00m';
=======
function calculate_hours($clock_in, $clock_out)
{
    if (!$clock_in || !$clock_out)
        return '0h 00m';
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
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
<<<<<<< HEAD
        
=======

>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
        $stmt = $conn->prepare("SELECT ClockInTime, ClockOutTime FROM Attendance WHERE UserID = ? AND WorkDate = ?");
        $stmt->bind_param("is", $userId, $today);
        $stmt->execute();
        $todaysRecord = $stmt->get_result()->fetch_assoc();

        $lastStmt = $conn->prepare("SELECT ClockInTime, ClockOutTime FROM Attendance WHERE UserID = ? AND ClockOutTime IS NOT NULL ORDER BY ClockOutTime DESC LIMIT 1");
        $lastStmt->bind_param("i", $userId);
        $lastStmt->execute();
        $lastRecord = $lastStmt->get_result()->fetch_assoc();
<<<<<<< HEAD
        
=======

>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
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
<<<<<<< HEAD
        $sql = "SELECT a.AttendanceID, a.UserID, e.Name, a.WorkDate, a.ClockInTime, a.ClockOutTime, a.Status
                FROM Attendance a
                JOIN Employee e ON a.UserID = e.UserID
                ORDER BY a.WorkDate DESC, e.Name ASC";
        $result = $conn->query($sql);
=======
        $date = $_GET['date'] ?? null;

        $sql = "SELECT a.AttendanceID, a.UserID, e.Name, a.WorkDate, a.ClockInTime, a.ClockOutTime, a.Status
                FROM Attendance a
                JOIN Employee e ON a.UserID = e.UserID";

        // Filter by date if provided (or default to today if intended, but let's stick to explicit filter)
        // Actually, user wants "default being today". Frontend will handle sending today's date.
        // Backend just needs to support filtering.

        $params = [];
        $types = "";

        if ($date) {
            $sql .= " WHERE a.WorkDate = ?";
            $params[] = $date;
            $types .= "s";
        }

        $sql .= " ORDER BY a.UserID DESC"; // Requested sort: ID biggest to smallest

        $stmt = $conn->prepare($sql);
        if ($date) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();

>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
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
<<<<<<< HEAD
        
=======

>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
        $now = date('Y-m-d H:i:s');
        $today = date('Y-m-d');

        $stmt = $conn->prepare("SELECT AttendanceID, ClockInTime, ClockOutTime FROM Attendance WHERE UserID = ? AND WorkDate = ?");
        $stmt->bind_param("is", $userId, $today);
        $stmt->execute();
        $record = $stmt->get_result()->fetch_assoc();

        if ($action == 'clock_in') {
            if ($record) {
<<<<<<< HEAD
                if($record['ClockOutTime']){
=======
                if ($record['ClockOutTime']) {
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
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
<<<<<<< HEAD
        $clockIn = $input['clockIn'] ?? null;
        $clockOut = $input['clockOut'] ?? null;
        $overwrittenBy = $input['overwrittenBy'] ?? null;
=======
        $clockIn = !empty($input['clockIn']) ? $input['clockIn'] : null;
        $clockOut = !empty($input['clockOut']) ? $input['clockOut'] : null;
        $overwrittenBy = !empty($input['overwrittenBy']) ? $input['overwrittenBy'] : null;
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd

        if (empty($attendanceId)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Attendance ID is required."]);
            exit;
        }

        $stmt = $conn->prepare("UPDATE Attendance SET ClockInTime = ?, ClockOutTime = ?, OverwrittenBy = ? WHERE AttendanceID = ?");
        $stmt->bind_param("ssii", $clockIn, $clockOut, $overwrittenBy, $attendanceId);
<<<<<<< HEAD
        
=======

>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Record updated successfully."]);
        } else {
            http_response_code(500);
<<<<<<< HEAD
            echo json_encode(["status" => "error", "message" => "Failed to update record."]);
=======
            echo json_encode(["status" => "error", "message" => "Failed to update record: " . $stmt->error]);
        }
    } elseif ($action == 'delete_record') {
        $attendanceId = $input['attendanceId'] ?? 0;

        if (empty($attendanceId)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Attendance ID is required."]);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM Attendance WHERE AttendanceID = ?");
        $stmt->bind_param("i", $attendanceId);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Record deleted successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to delete record."]);
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid POST action."]);
    }
}

$conn->close();
<<<<<<< HEAD
?>
=======
?>
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd

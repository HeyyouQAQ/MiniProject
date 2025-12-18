<?php
error_reporting(0);
ini_set('display_errors', 0);
require 'db_connect.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET Requests
if ($method == 'GET') {
    
    // Get schedule for a specific staff member
    if ($action == 'get_staff_schedule') {
        $userId = $_GET['userId'] ?? 0;
        
        if (!$userId) {
            echo json_encode(["status" => "error", "message" => "User ID required"]);
            exit;
        }
        
        // Get this week's schedule (Monday to Sunday)
        $monday = date('Y-m-d', strtotime('monday this week'));
        $sunday = date('Y-m-d', strtotime('sunday this week'));
        
        $stmt = $conn->prepare("SELECT ScheduleID, ShiftDate, StartTime, EndTime, TaskDescription, Status 
                                FROM Schedule 
                                WHERE UserID = ? AND ShiftDate BETWEEN ? AND ?
                                ORDER BY ShiftDate ASC");
        
        $schedules = [];
        if ($stmt) {
            $stmt->bind_param("iss", $userId, $monday, $sunday);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result) {
                while ($row = $result->fetch_assoc()) {
                    $schedules[] = $row;
                }
            }
        }
        
        echo json_encode(["status" => "success", "data" => $schedules]);
        exit;
    }
    
    // Get all schedules (for HR view)
    if ($action == 'get_all_schedules') {
        $weekOffset = isset($_GET['weekOffset']) ? intval($_GET['weekOffset']) : 0;
        
        $monday = date('Y-m-d', strtotime("monday this week " . ($weekOffset >= 0 ? '+' : '') . $weekOffset . " weeks"));
        $sunday = date('Y-m-d', strtotime("sunday this week " . ($weekOffset >= 0 ? '+' : '') . $weekOffset . " weeks"));
        
        $sql = "SELECT s.ScheduleID, s.UserID, e.Name as EmployeeName, s.ShiftDate, 
                       s.StartTime, s.EndTime, s.TaskDescription, s.Status
                FROM Schedule s
                JOIN Employee e ON s.UserID = e.UserID
                WHERE s.ShiftDate BETWEEN '$monday' AND '$sunday'
                ORDER BY s.ShiftDate ASC, e.Name ASC";
        
        $schedules = [];
        try {
            $result = @$conn->query($sql);
            if ($result) {
                while ($row = $result->fetch_assoc()) {
                    $schedules[] = $row;
                }
            }
        } catch (Exception $e) {
            // Silently fail, return empty array
        }
        
        echo json_encode(["status" => "success", "data" => $schedules, "weekStart" => $monday, "weekEnd" => $sunday]);
        exit;
    }
    
    // Get staff list for dropdown
    if ($action == 'get_staff_list') {
        // Get Staff/Worker role IDs
        $roleRes = $conn->query("SELECT RoleID FROM Role WHERE Type = 'Staff' OR Type = 'Worker'");
        $roleIds = [];
        if ($roleRes) {
            while ($r = $roleRes->fetch_assoc()) {
                $roleIds[] = $r['RoleID'];
            }
        }
        
        if (count($roleIds) > 0) {
            $roleIdList = implode(',', $roleIds);
            $sql = "SELECT UserID, Name FROM Employee WHERE RoleID IN ($roleIdList) ORDER BY Name ASC";
        } else {
            $sql = "SELECT UserID, Name FROM Employee ORDER BY Name ASC";
        }
        
        $result = $conn->query($sql);
        $staff = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $staff[] = $row;
            }
        }
        
        echo json_encode(["status" => "success", "data" => $staff]);
        exit;
    }
    
    echo json_encode(["status" => "error", "message" => "Invalid GET action"]);
    exit;
}

// POST Requests
if ($method == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Create new schedule
    if ($action == 'create_schedule') {
        $userId = $input['userId'] ?? 0;
        $shiftDate = $input['shiftDate'] ?? '';
        $startTime = $input['startTime'] ?? null;
        $endTime = $input['endTime'] ?? null;
        $taskDescription = $input['taskDescription'] ?? '';
        $status = $input['status'] ?? 'Scheduled';
        $createdBy = $input['createdBy'] ?? null;
        
        if (!$userId || !$shiftDate) {
            echo json_encode(["status" => "error", "message" => "User ID and Shift Date required"]);
            exit;
        }
        
        // Use INSERT ... ON DUPLICATE KEY UPDATE to handle existing schedules
        try {
            $stmt = @$conn->prepare("INSERT INTO Schedule (UserID, ShiftDate, StartTime, EndTime, TaskDescription, Status, CreatedBy)
                                    VALUES (?, ?, ?, ?, ?, ?, ?)
                                    ON DUPLICATE KEY UPDATE 
                                    StartTime = VALUES(StartTime), 
                                    EndTime = VALUES(EndTime),
                                    TaskDescription = VALUES(TaskDescription),
                                    Status = VALUES(Status)");
            if ($stmt) {
                $stmt->bind_param("isssssi", $userId, $shiftDate, $startTime, $endTime, $taskDescription, $status, $createdBy);
                
                if ($stmt->execute()) {
                    echo json_encode(["status" => "success", "message" => "Schedule saved successfully"]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Failed to save schedule: " . $stmt->error]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => "Database prepare failed: " . $conn->error]);
            }
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => "Exception: " . $e->getMessage()]);
        }
        exit;
    }
    
    // Update schedule
    if ($action == 'update_schedule') {
        $scheduleId = $input['scheduleId'] ?? 0;
        $startTime = $input['startTime'] ?? null;
        $endTime = $input['endTime'] ?? null;
        $taskDescription = $input['taskDescription'] ?? '';
        $status = $input['status'] ?? 'Scheduled';
        
        if (!$scheduleId) {
            echo json_encode(["status" => "error", "message" => "Schedule ID required"]);
            exit;
        }
        
        $stmt = $conn->prepare("UPDATE Schedule SET StartTime = ?, EndTime = ?, TaskDescription = ?, Status = ? WHERE ScheduleID = ?");
        $stmt->bind_param("ssssi", $startTime, $endTime, $taskDescription, $status, $scheduleId);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Schedule updated successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to update schedule"]);
        }
        exit;
    }
    
    echo json_encode(["status" => "error", "message" => "Invalid POST action"]);
    exit;
}

// DELETE Request
if ($method == 'DELETE') {
    $scheduleId = $_GET['id'] ?? 0;
    
    if (!$scheduleId) {
        echo json_encode(["status" => "error", "message" => "Schedule ID required"]);
        exit;
    }
    
    $stmt = $conn->prepare("DELETE FROM Schedule WHERE ScheduleID = ?");
    $stmt->bind_param("i", $scheduleId);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Schedule deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete schedule"]);
    }
    exit;
}

$conn->close();
?>

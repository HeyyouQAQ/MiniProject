<?php
require 'db_connect.php';

header('Content-Type: application/json');

function generate_attendance($conn)
{
    // Configuration
    $userId = 2; // Assuming UserID 2 is "staff"
    $startDate = new DateTime('2025-11-01');
    $endDate = new DateTime('2025-12-16'); // Today

    $recordsGenerated = 0;
    $errors = [];
    $statuses = ['Present', 'Late', 'Half Day'];

    $currentDate = clone $startDate;

    while ($currentDate <= $endDate) {
        // Updated: NO weekend skipping (7 days a week work)

        // 90% chance to be present on ANY day
        if (mt_rand(1, 100) <= 90) {
            $workDate = $currentDate->format('Y-m-d');

            // Determine status
            $rand = mt_rand(1, 100);
            if ($rand <= 80)
                $status = 'Present';
            elseif ($rand <= 95)
                $status = 'Late';
            else
                $status = 'Half Day';

            // Generate Clock In (around 9:00 AM)
            $clockInHour = 9;
            $clockInMinute = mt_rand(0, 30); // 9:00 - 9:30

            if ($status === 'Late') {
                $clockInHour = mt_rand(9, 10);
                $clockInMinute = mt_rand(15, 59);
            }

            $clockInKey = "$workDate " . sprintf("%02d:%02d:00", $clockInHour, $clockInMinute);

            // Generate Clock Out (around 6:00 PM, 9 hours later roughly)
            $clockOutHour = 18; // 6 PM
            $clockOutMinute = mt_rand(0, 59);

            if ($status === 'Half Day') {
                $clockOutHour = 13; // 1 PM
            }

            $clockOutKey = "$workDate " . sprintf("%02d:%02d:00", $clockOutHour, $clockOutMinute);

            // Insert Record
            $sql = "INSERT INTO Attendance (UserID, WorkDate, ClockInTime, ClockOutTime, Status) 
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE Status=VALUES(Status), ClockInTime=VALUES(ClockInTime), ClockOutTime=VALUES(ClockOutTime)";

            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                $errors[] = "Prepare failed for $workDate: " . $conn->error;
            } else {
                $stmt->bind_param("issss", $userId, $workDate, $clockInKey, $clockOutKey, $status);
                if ($stmt->execute()) {
                    $recordsGenerated++;
                } else {
                    $errors[] = "Execute failed for $workDate: " . $stmt->error;
                }
                $stmt->close();
            }
        }

        $currentDate->modify('+1 day');
    }

    echo json_encode([
        "status" => "success",
        "message" => "Regenerated $recordsGenerated dummy attendance records (7-day week)",
        "errors" => $errors
    ]);
}

try {
    generate_attendance($conn);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
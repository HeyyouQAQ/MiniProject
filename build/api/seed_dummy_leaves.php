<?php
require 'db_connect.php';

header('Content-Type: application/json');

function generate_leaves($conn)
{
    // Configuration
    $userId = 2; // Assuming UserID 2 is "staff"
    $reviewerId = 1; // Assuming UserID 1 is admin/HR
    $startDate = new DateTime('2025-11-01');
    $endDate = new DateTime('2025-12-16'); // Today

    $leaveTypes = ['Annual', 'Sick', 'Unpaid', 'Other'];
    $statuses = ['Approved', 'Rejected', 'Pending'];
    $reasons = [
        'Annual' => ['Family vaction', 'Personal errands', 'Rest day', 'Travelling abroad'],
        'Sick' => ['Fever', 'Flu', 'Medical checkup', 'Dental appointment'],
        'Unpaid' => ['Personal emergency', 'Extended leave'],
        'Other' => ['Compassionate leave', 'Wedding attendance']
    ];

    $leavesGenerated = 0;
    $errors = [];

    // Generate ~8 leave applications dispersed over the period
    for ($i = 0; $i < 10; $i++) {
        // Random date within range
        $timestamp = mt_rand($startDate->getTimestamp(), $endDate->getTimestamp());
        $leaveStart = new DateTime();
        $leaveStart->setTimestamp($timestamp);

        // Skip weekends for start date
        if ($leaveStart->format('N') >= 6)
            continue;

        // Random duration 1-3 days
        $duration = mt_rand(1, 3);
        $leaveEnd = clone $leaveStart;
        if ($duration > 1) {
            $leaveEnd->modify('+' . ($duration - 1) . ' days');
        }

        $type = $leaveTypes[array_rand($leaveTypes)];
        $reason = $reasons[$type][array_rand($reasons[$type])];

        // Random status probability
        $rand = mt_rand(1, 100);
        if ($rand <= 60)
            $status = 'Approved';
        elseif ($rand <= 80)
            $status = 'Rejected';
        else
            $status = 'Pending';

        $reviewedBy = ($status === 'Pending') ? null : $reviewerId;
        // Format dates
        $sDate = $leaveStart->format('Y-m-d');
        $eDate = $leaveEnd->format('Y-m-d');

        $sql = "INSERT INTO leaveapplication 
                (UserID, LeaveType, StartDate, EndDate, Reason, Status, ReviewedBy) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            $errors[] = "Prepare failed: " . $conn->error;
            continue;
        }

        $stmt->bind_param("isssssi", $userId, $type, $sDate, $eDate, $reason, $status, $reviewedBy);

        if ($stmt->execute()) {
            $leavesGenerated++;
        } else {
            $errors[] = "Execute failed: " . $stmt->error;
        }
        $stmt->close();
    }

    echo json_encode([
        "status" => "success",
        "message" => "Generated $leavesGenerated dummy leave records",
        "errors" => $errors
    ]);
}

try {
    generate_leaves($conn);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
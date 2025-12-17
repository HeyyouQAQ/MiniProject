<?php
require 'db_connect.php';

header('Content-Type: application/json');

function seed_payroll($conn)
{
    $userId = 2; // Staff

    $records = [
        [
            'start' => '2025-11-01',
            'end' => '2025-11-30',
            'hours' => 168.5,
            'gross' => 2527.50, // 15 * 168.5
            'deduction' => 0.00,
            'net' => 2527.50,
            'status' => 'Paid'
        ],
        [
            'start' => '2025-12-01',
            'end' => '2025-12-31',
            'hours' => 88.0, // Partial month
            'gross' => 1320.00,
            'deduction' => 0.00,
            'net' => 1320.00,
            'status' => 'Generated' // Not paid yet
        ]
    ];

    $count = 0;

    foreach ($records as $r) {
        // Check if exists
        $check = $conn->prepare("SELECT PayrollID FROM Payroll WHERE UserID = ? AND PayPeriodStart = ?");
        $check->bind_param("is", $userId, $r['start']);
        $check->execute();
        if ($check->get_result()->num_rows == 0) {
            $sql = "INSERT INTO Payroll (UserID, PayPeriodStart, PayPeriodEnd, TotalHours, GrossPay, Deductions, NetPay, Status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("issdddds", $userId, $r['start'], $r['end'], $r['hours'], $r['gross'], $r['deduction'], $r['net'], $r['status']);
            if ($stmt->execute()) {
                $count++;
            }
        }
    }

    echo json_encode(["status" => "success", "message" => "Seeded $count payroll records."]);
}

try {
    seed_payroll($conn);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
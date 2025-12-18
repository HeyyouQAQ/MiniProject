<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db_connect.php';

$response = ["steps" => []];

try {
    // 1. Backup existing table
    $checkTable = $conn->query("SHOW TABLES LIKE 'SystemConfiguration'");
    if ($checkTable->num_rows > 0) {
        $conn->query("DROP TABLE IF EXISTS SystemConfiguration_backup");
        if ($conn->query("CREATE TABLE SystemConfiguration_backup AS SELECT * FROM SystemConfiguration")) {
            $response['steps'][] = "Backup created: SystemConfiguration_backup";
        }
    }

    // 2. Drop old table
    $conn->query("DROP TABLE IF EXISTS SystemConfiguration");
    $response['steps'][] = "Dropped old SystemConfiguration table";

    // 3. Create new table
    $sql = "CREATE TABLE SystemConfiguration (
        ConfigID INT PRIMARY KEY AUTO_INCREMENT,
    
        -- Leave Configuration
        DefaultAnnualLeaveDays INT DEFAULT 15,
        DefaultSickLeaveDays INT DEFAULT 14,
        CarryForwardLeaveLimit INT DEFAULT 5,
    
        -- Payroll Configuration
        PayrollCycleDay INT DEFAULT 25,
        OT_Rate_Per_Hour DECIMAL(10,2) DEFAULT 1.50,
        MinimumOTMinutes INT DEFAULT 30,
        LatePenaltyAmount DECIMAL(10,2) DEFAULT 5.00,
        AbsencePenaltyAmount DECIMAL(10,2) DEFAULT 20.00,
    
        -- Attendance Rules
        MinimumShiftBreakMins INT DEFAULT 60,
        MaxLateMinsAllowed INT DEFAULT 10,
    
        -- Shift & Scheduling Rules
        MaxDailyWorkingHours INT DEFAULT 8,
        MaxWeeklyWorkingHours INT DEFAULT 48,
        MinimumShiftHours INT DEFAULT 4,
    
        -- Audit Information
        LastModifiedBy INT,
        LastModifiedAt DATETIME DEFAULT CURRENT_TIMESTAMP 
            ON UPDATE CURRENT_TIMESTAMP,
    
        FOREIGN KEY (LastModifiedBy) REFERENCES Employee(UserID)
    )";

    if ($conn->query($sql)) {
        $response['steps'][] = "Created new SystemConfiguration table";
    } else {
        throw new Exception("Error creating table: " . $conn->error);
    }

    // 4. Seed default data (trying to recover from backup if relevant, else defaults)
    // We'll just insert a fresh default row since the schema changed significantly.
    // However, let's look for common fields to restore values if possible.
    
    $commonFields = [
        'DefaultAnnualLeaveDays', 
        'PayrollCycleDay', 
        'MinimumShiftBreakMins', 
        'LatePenaltyAmount'
    ];
    
    $defaultInsert = "INSERT INTO SystemConfiguration (
        DefaultAnnualLeaveDays, DefaultSickLeaveDays, CarryForwardLeaveLimit,
        PayrollCycleDay, OT_Rate_Per_Hour, MinimumOTMinutes, LatePenaltyAmount, AbsencePenaltyAmount,
        MinimumShiftBreakMins, MaxLateMinsAllowed,
        MaxDailyWorkingHours, MaxWeeklyWorkingHours, MinimumShiftHours
    ) VALUES (
        15, 14, 5,
        25, 1.50, 30, 5.00, 20.00,
        60, 10,
        8, 48, 4
    )";

    // Try to restore specific values from backup
    $restored = false;
    $checkBackup = $conn->query("SHOW TABLES LIKE 'SystemConfiguration_backup'");
    if ($checkBackup->num_rows > 0) {
        $backupRes = $conn->query("SELECT * FROM SystemConfiguration_backup LIMIT 1");
        if ($backupRes && $backupRes->num_rows > 0) {
            $oldRow = $backupRes->fetch_assoc();
            
            // Map old values if they exist
            $annualLeave = $oldRow['DefaultAnnualLeaveDays'] ?? 15;
            $payrollDay = $oldRow['PayrollCycleDay'] ?? 25;
            $breakMins = $oldRow['MinimumShiftBreakMins'] ?? 60;
            $latePenalty = $oldRow['LatePenaltyAmount'] ?? 5.00;

            // Construct insert with restored values + new defaults
            $stmt = $conn->prepare("INSERT INTO SystemConfiguration (
                DefaultAnnualLeaveDays, DefaultSickLeaveDays, CarryForwardLeaveLimit,
                PayrollCycleDay, OT_Rate_Per_Hour, MinimumOTMinutes, LatePenaltyAmount, AbsencePenaltyAmount,
                MinimumShiftBreakMins, MaxLateMinsAllowed,
                MaxDailyWorkingHours, MaxWeeklyWorkingHours, MinimumShiftHours
            ) VALUES (?, 14, 5, ?, 1.50, 30, ?, 20.00, ?, 10, 8, 48, 4)");
            
            $stmt->bind_param("iidi", $annualLeave, $payrollDay, $latePenalty, $breakMins);
            
            if ($stmt->execute()) {
                $response['steps'][] = "Inserted initial data (merged with recovered values)";
                $restored = true;
            }
        }
    }

    if (!$restored) {
        if ($conn->query($defaultInsert)) {
            $response['steps'][] = "Inserted default configuration data";
        }
    }

    echo json_encode(["status" => "success", "message" => "SystemConfiguration migration completed", "details" => $response]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage(), "steps_completed" => $response['steps']]);
}

$conn->close();
?>

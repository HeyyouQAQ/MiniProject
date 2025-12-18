<?php
require_once 'db_connect.php';

header('Content-Type: text/plain');

try {
    // 1. Drop existing table
    $dropSql = "DROP TABLE IF EXISTS SystemConfiguration";
    if ($conn->query($dropSql) === TRUE) {
        echo "Table SystemConfiguration dropped successfully.\n";
    } else {
        throw new Exception("Error dropping table: " . $conn->error);
    }

    // 2. Create new table with strict schema provided by user
    $createSql = "CREATE TABLE IF NOT EXISTS SystemConfiguration (
        ConfigID INT PRIMARY KEY AUTO_INCREMENT,

        -- Leave Configuration
        DefaultAnnualLeaveDays INT DEFAULT 15,
        DefaultSickLeaveDays INT DEFAULT 14,
        CarryForwardLeaveLimit INT DEFAULT 5,

        -- Payroll Rules (General)
        PayrollCycleDay INT DEFAULT 25,       -- e.g., Cutoff on the 25th
        OT_Multiplier DECIMAL(4,2) DEFAULT 1.50, -- Changed name for clarity (1.5x, 2.0x)
        MinimumOTMinutes INT DEFAULT 30,

        -- Penalty Rules (Fixed Amounts)
        LatePenaltyAmount DECIMAL(10,2) DEFAULT 5.00,   -- Deduct RM5 per late
        AbsencePenaltyAmount DECIMAL(10,2) DEFAULT 50.00, -- Deduct RM50 per absence

        -- Statutory Rates (Percentages for Auto-Calculation)
        EPF_Rate_Employee DECIMAL(5,4) DEFAULT 0.1100,  -- 11%
        EPF_Rate_Employer DECIMAL(5,4) DEFAULT 0.1300,  -- 13%
        SOCSO_Rate_Employee DECIMAL(5,4) DEFAULT 0.0050, -- 0.5% (Approx)
        SOCSO_Rate_Employer DECIMAL(5,4) DEFAULT 0.0175, -- 1.75% (Approx)

        -- Attendance Rules
        MinimumShiftBreakMins INT DEFAULT 60,
        MaxLateMinsAllowed INT DEFAULT 10,    -- Grace period

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

    if ($conn->query($createSql) === TRUE) {
        echo "Table SystemConfiguration created successfully.\n";
    } else {
        throw new Exception("Error creating table: " . $conn->error);
    }

    // 3. Insert Default Row (so the app doesn't break)
    // We need a valid Employee ID for LastModifiedBy. Let's find one or use NULL if allowed (it is allowed by schema, but FK checks might fail if we pass a bad ID).
    // The schema allows LastModifiedBy to be NULL (no NOT NULL constraint).
    
    // Check if we have an admin user to link, otherwise null
    $adminId = 'NULL';
    $res = $conn->query("SELECT UserID FROM Employee LIMIT 1");
    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        $adminId = $row['UserID'];
    }

    $insertSql = "INSERT INTO SystemConfiguration (
        DefaultAnnualLeaveDays, DefaultSickLeaveDays, CarryForwardLeaveLimit,
        PayrollCycleDay, OT_Multiplier, MinimumOTMinutes,
        LatePenaltyAmount, AbsencePenaltyAmount,
        EPF_Rate_Employee, EPF_Rate_Employer, SOCSO_Rate_Employee, SOCSO_Rate_Employer,
        MinimumShiftBreakMins, MaxLateMinsAllowed,
        MaxDailyWorkingHours, MaxWeeklyWorkingHours, MinimumShiftHours,
        LastModifiedBy
    ) VALUES (
        15, 14, 5,
        25, 1.50, 30,
        5.00, 50.00,
        0.1100, 0.1300, 0.0050, 0.0175,
        60, 10,
        8, 48, 4,
        $adminId
    )";

    if ($conn->query($insertSql) === TRUE) {
        echo "Default configuration row inserted successfully.\n";
    } else {
        throw new Exception("Error inserting default row: " . $conn->error);
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

$conn->close();
?>

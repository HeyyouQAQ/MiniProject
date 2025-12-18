<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // 1. Fetch SystemConfiguration (assuming 1st row or specific ID, we'll take top 1)
    // 2. Fetch OvertimeRules (all rules)

    $configData = [];

    $confSql = "SELECT * FROM SystemConfiguration LIMIT 1";
    $confRes = $conn->query($confSql);
    if ($confRes && $confRes->num_rows > 0) {
        $row = $confRes->fetch_assoc();
        
        // Leave Config
        $configData['defaultAnnualLeaveDays'] = $row['DefaultAnnualLeaveDays'] ?? 15;
        $configData['defaultSickLeaveDays'] = $row['DefaultSickLeaveDays'] ?? 14;
        $configData['carryForwardLeaveLimit'] = $row['CarryForwardLeaveLimit'] ?? 5;

        // Payroll Config
            $configData['payrollCycleDay'] = $row['PayrollCycleDay'] ?? 25;
        $configData['otMultiplier'] = $row['OT_Multiplier'] ?? 1.50;
        $configData['minimumOTMinutes'] = $row['MinimumOTMinutes'] ?? 30;
        $configData['latePenaltyAmount'] = $row['LatePenaltyAmount'] ?? 5.00;
        $configData['absencePenaltyAmount'] = $row['AbsencePenaltyAmount'] ?? 50.00;
        
        $configData['epfRateEmployee'] = $row['EPF_Rate_Employee'] ?? 0.1100;
        $configData['epfRateEmployer'] = $row['EPF_Rate_Employer'] ?? 0.1300;
        $configData['socsoRateEmployee'] = $row['SOCSO_Rate_Employee'] ?? 0.0050;
        $configData['socsoRateEmployer'] = $row['SOCSO_Rate_Employer'] ?? 0.0175;

        // Attendance Rules
        $configData['minimumShiftBreakMins'] = $row['MinimumShiftBreakMins'] ?? 60;
        $configData['maxLateMinsAllowed'] = $row['MaxLateMinsAllowed'] ?? 10;

        // Shift Rules
        $configData['maxDailyWorkingHours'] = $row['MaxDailyWorkingHours'] ?? 8;
        $configData['maxWeeklyWorkingHours'] = $row['MaxWeeklyWorkingHours'] ?? 48;
        $configData['minimumShiftHours'] = $row['MinimumShiftHours'] ?? 4;
    }

    $rulesData = [];
    $ruleSql = "SELECT * FROM OvertimeRules";
    $ruleRes = $conn->query($ruleSql);
    if ($ruleRes && $ruleRes->num_rows > 0) {
        while ($r = $ruleRes->fetch_assoc()) {
            // ... (Overtime rules logic remains unchanged)
            $rulesData[] = [
                'ruleId' => $r['RuleID'],
                'ruleName' => $r['RuleName'],
                'factor' => $r['Factor'],
                'requiredHoursTrigger' => $r['RequiredHoursTrigger']
            ];
        }
    }

    echo json_encode([
        'systemConfig' => $configData,
        'overtimeRules' => $rulesData
    ]);

} elseif ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    try {
        // Update System Config
        if (isset($data['systemConfig'])) {
            $sc = $data['systemConfig'];
            $modifierId = 1; // Default to System Admin

            // ... (Self-heal logic remains unchanged)
            $uCheck = $conn->query("SELECT UserID FROM Employee WHERE UserID = $modifierId");
            if ($uCheck->num_rows == 0) {
                 // ... (Create Admin logic)
                 $rCheck = $conn->query("SELECT RoleID FROM Role WHERE Type='Manager' LIMIT 1");
                 if ($rCheck->num_rows > 0) {
                     $rowR = $rCheck->fetch_assoc();
                     $roleId = $rowR['RoleID'];
                 } else {
                     $conn->query("INSERT INTO Role (Type) VALUES ('Manager')");
                     $roleId = $conn->insert_id;
                 }
                 $conn->query("INSERT INTO Employee (UserID, Name, Email, RoleID, HiringDate) VALUES ($modifierId, 'System Admin', 'admin@system.local', $roleId, NOW())");
            }

            // Check if config exists
            $check = $conn->query("SELECT ConfigID FROM SystemConfiguration LIMIT 1");
            if ($check && $check->num_rows > 0) {
                $row = $check->fetch_assoc();
                $confId = $row['ConfigID'];

                $stmt = $conn->prepare("UPDATE SystemConfiguration SET 
                    DefaultAnnualLeaveDays=?, DefaultSickLeaveDays=?, CarryForwardLeaveLimit=?,
                    PayrollCycleDay=?, OT_Multiplier=?, MinimumOTMinutes=?, 
                    LatePenaltyAmount=?, AbsencePenaltyAmount=?,
                    EPF_Rate_Employee=?, EPF_Rate_Employer=?, SOCSO_Rate_Employee=?, SOCSO_Rate_Employer=?,
                    MinimumShiftBreakMins=?, MaxLateMinsAllowed=?,
                    MaxDailyWorkingHours=?, MaxWeeklyWorkingHours=?, MinimumShiftHours=?,
                    LastModifiedBy=? 
                    WHERE ConfigID=?");
                
                if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
                
                $stmt->bind_param(
                    "iiiididdddddiiiiii",
                    $sc['defaultAnnualLeaveDays'],
                    $sc['defaultSickLeaveDays'],
                    $sc['carryForwardLeaveLimit'],
                    $sc['payrollCycleDay'],
                    $sc['otMultiplier'],
                    $sc['minimumOTMinutes'],
                    $sc['latePenaltyAmount'],
                    $sc['absencePenaltyAmount'],
                    $sc['epfRateEmployee'],
                    $sc['epfRateEmployer'],
                    $sc['socsoRateEmployee'],
                    $sc['socsoRateEmployer'],
                    $sc['minimumShiftBreakMins'],
                    $sc['maxLateMinsAllowed'],
                    $sc['maxDailyWorkingHours'],
                    $sc['maxWeeklyWorkingHours'],
                    $sc['minimumShiftHours'],
                    $modifierId,
                    $confId
                );
                
                if (!$stmt->execute()) throw new Exception("Update Config failed: " . $stmt->error);

            } else {
                // Insert
                $stmt = $conn->prepare("INSERT INTO SystemConfiguration (
                    DefaultAnnualLeaveDays, DefaultSickLeaveDays, CarryForwardLeaveLimit,
                    PayrollCycleDay, OT_Multiplier, MinimumOTMinutes, 
                    LatePenaltyAmount, AbsencePenaltyAmount,
                    EPF_Rate_Employee, EPF_Rate_Employer, SOCSO_Rate_Employee, SOCSO_Rate_Employer,
                    MinimumShiftBreakMins, MaxLateMinsAllowed,
                    MaxDailyWorkingHours, MaxWeeklyWorkingHours, MinimumShiftHours,
                    LastModifiedBy
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                
                if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
                
                $stmt->bind_param(
                    "iiiididdddddiiiiii",
                    $sc['defaultAnnualLeaveDays'],
                    $sc['defaultSickLeaveDays'],
                    $sc['carryForwardLeaveLimit'],
                    $sc['payrollCycleDay'],
                    $sc['otMultiplier'],
                    $sc['minimumOTMinutes'],
                    $sc['latePenaltyAmount'],
                    $sc['absencePenaltyAmount'],
                    $sc['epfRateEmployee'],
                    $sc['epfRateEmployer'],
                    $sc['socsoRateEmployee'],
                    $sc['socsoRateEmployer'],
                    $sc['minimumShiftBreakMins'],
                    $sc['maxLateMinsAllowed'],
                    $sc['maxDailyWorkingHours'],
                    $sc['maxWeeklyWorkingHours'],
                    $sc['minimumShiftHours'],
                    $modifierId
                );
                
                if (!$stmt->execute()) throw new Exception("Insert Config failed: " . $stmt->error);
            }
        }

        // Update Overtime Rules
        if (isset($data['overtimeRules']) && is_array($data['overtimeRules'])) {
            $rules = $data['overtimeRules'];
            $stmt = $conn->prepare("UPDATE OvertimeRules SET RuleName=?, Factor=?, RequiredHoursTrigger=? WHERE RuleID=?");

            foreach ($rules as $rule) {
                $rName = $rule['ruleName'];
                $rFactor = $rule['factor'];
                $rTrigger = $rule['requiredHoursTrigger'];
                $rId = $rule['ruleId'];

                $stmt->bind_param("sddi", $rName, $rFactor, $rTrigger, $rId);
                if (!$stmt->execute()) {
                    throw new Exception("Update Rule $rId failed: " . $stmt->error);
                }
            }
            $stmt->close();
        }

        echo json_encode(["status" => "success", "message" => "Configuration and Rules saved"]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

$conn->close();
?>
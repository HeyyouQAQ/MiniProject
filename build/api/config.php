<?php
require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // 1. Fetch SystemConfiguration (assuming 1st row or specific ID, we'll take top 1)
    // 2. Fetch OvertimeRules (all rules)

    $configData = [];

    $confSql = "SELECT * FROM SystemConfiguration LIMIT 1";
    $confRes = $conn->query($confSql);
    if ($confRes->num_rows > 0) {
        $row = $confRes->fetch_assoc();
        $configData['configId'] = $row['ConfigID'];
        $configData['defaultAnnualLeaveDays'] = $row['DefaultAnnualLeaveDays'];
        $configData['payrollCycleDay'] = $row['PayrollCycleDay'];
        $configData['qrTokenExportMins'] = $row['QR_TOKEN_Export_Mins'];
        $configData['minimumShiftBreakMins'] = $row['MinimumShiftBreakMins'];
        $configData['latePenaltyAmount'] = isset($row['LatePenaltyAmount']) ? $row['LatePenaltyAmount'] : '5.00';
        $configData['defaultHourlyRate'] = isset($row['DefaultHourlyRate']) ? $row['DefaultHourlyRate'] : '15.00';
    }

    $rulesData = [];
    $ruleSql = "SELECT * FROM OvertimeRules";
    $ruleRes = $conn->query($ruleSql);
    if ($ruleRes->num_rows > 0) {
        while ($r = $ruleRes->fetch_assoc()) {
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
            $modifierId = 1;

            // --- SELF-HEAL: Ensure Modifier Exists ---
            $uCheck = $conn->query("SELECT UserID FROM Employee WHERE UserID = $modifierId");
            if ($uCheck->num_rows == 0) {
                // Check/Create Role
                $rCheck = $conn->query("SELECT RoleID FROM Role WHERE Type='Manager' LIMIT 1");
                if ($rCheck->num_rows > 0) {
                    $rowR = $rCheck->fetch_assoc();
                    $roleId = $rowR['RoleID'];
                } else {
                    $conn->query("INSERT INTO Role (Type) VALUES ('Manager')");
                    $roleId = $conn->insert_id;
                }

                // Create User 1
                $conn->query("INSERT INTO Employee (UserID, Name, Email, RoleID, HiringDate) VALUES ($modifierId, 'System Admin', 'admin@system.local', $roleId, NOW())");
            }
            // -----------------------------------------

            // Check if config exists
            $check = $conn->query("SELECT ConfigID FROM SystemConfiguration LIMIT 1");
            if ($check->num_rows > 0) {
                $row = $check->fetch_assoc();
                $confId = $row['ConfigID'];

                $stmt = $conn->prepare("UPDATE SystemConfiguration SET DefaultAnnualLeaveDays=?, PayrollCycleDay=?, QR_TOKEN_Export_Mins=?, MinimumShiftBreakMins=?, LatePenaltyAmount=?, DefaultHourlyRate=?, LastModifiedBy=? WHERE ConfigID=?");
                if (!$stmt) {
                    throw new Exception("Prepare failed: " . $conn->error);
                }
                $defaultHourlyRate = isset($sc['defaultHourlyRate']) ? floatval($sc['defaultHourlyRate']) : 15.00;
                // types: i (annual), i (payroll), i (qr), i (break), d (penalty), d (hourlyRate), i (modifier), i (confId)
                $stmt->bind_param(
                    "iiiiddii",
                    $sc['defaultAnnualLeaveDays'],
                    $sc['payrollCycleDay'],
                    $sc['qrTokenExportMins'],
                    $sc['minimumShiftBreakMins'],
                    $sc['latePenaltyAmount'],
                    $defaultHourlyRate,
                    $modifierId,
                    $confId
                );
                if (!$stmt->execute()) {
                    throw new Exception("Update Config failed: " . $stmt->error);
                }
            } else {
                // Insert
                $stmt = $conn->prepare("INSERT INTO SystemConfiguration (DefaultAnnualLeaveDays, PayrollCycleDay, QR_TOKEN_Export_Mins, MinimumShiftBreakMins, LatePenaltyAmount, DefaultHourlyRate, LastModifiedBy) VALUES (?, ?, ?, ?, ?, ?, ?)");
                if (!$stmt) {
                    throw new Exception("Prepare failed: " . $conn->error);
                }
                $defaultHourlyRate = isset($sc['defaultHourlyRate']) ? floatval($sc['defaultHourlyRate']) : 15.00;
                // types: i, i, i, i, d, d, i
                $stmt->bind_param(
                    "iiiiddi",
                    $sc['defaultAnnualLeaveDays'],
                    $sc['payrollCycleDay'],
                    $sc['qrTokenExportMins'],
                    $sc['minimumShiftBreakMins'],
                    $sc['latePenaltyAmount'],
                    $defaultHourlyRate,
                    $modifierId
                );
                if (!$stmt->execute()) {
                    throw new Exception("Insert Config failed: " . $stmt->error);
                }
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
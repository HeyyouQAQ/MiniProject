<?php
/**
 * Employee Table Migration Script
 * Migrates from old simple schema to new comprehensive schema
 */

require 'db_connect.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Employee Table Migration</h1>";
echo "<pre>";

try {
    // Disable foreign key checks temporarily
    $conn->query("SET FOREIGN_KEY_CHECKS = 0");
    echo "[✓] Disabled foreign key checks\n";

    // Step 1: Backup existing Employee table
    $conn->query("DROP TABLE IF EXISTS Employee_backup");
    $conn->query("CREATE TABLE Employee_backup AS SELECT * FROM Employee");
    echo "[✓] Backed up existing Employee table to Employee_backup\n";

    // Step 2: Get existing employee data
    $existingData = [];
    $result = $conn->query("SELECT * FROM Employee");
    while ($row = $result->fetch_assoc()) {
        $existingData[] = $row;
    }
    echo "[✓] Retrieved " . count($existingData) . " existing employee records\n";

    // Step 3: Drop the existing Employee table
    $conn->query("DROP TABLE IF EXISTS Employee");
    echo "[✓] Dropped existing Employee table\n";

    // Step 4: Create new Employee table with full schema
    $createTableSQL = "
    CREATE TABLE Employee (
        UserID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        RoleID INT NOT NULL,

        Name VARCHAR(100) NOT NULL,
        ICNumber VARCHAR(20) NOT NULL,
        DateOfBirth DATE NOT NULL,
        Gender ENUM('Male','Female','Other') NOT NULL DEFAULT 'Other',
        ContactNumber VARCHAR(20) NOT NULL,
        Email VARCHAR(100) NOT NULL UNIQUE,
        Address TEXT,

        Position VARCHAR(50) NOT NULL DEFAULT 'Staff',
        EmploymentType ENUM('Full-Time','Part-Time','Contract') NOT NULL DEFAULT 'Full-Time',
        HiringDate DATE NOT NULL,
        EmploymentStatus ENUM('Active','Inactive','Resigned','Terminated') DEFAULT 'Active',

        BankName VARCHAR(50) NOT NULL DEFAULT 'N/A',
        BankAccountNumber VARCHAR(30) NOT NULL DEFAULT 'N/A',
        EPFNumber VARCHAR(30),
        SOCSONumber VARCHAR(30),
        EISNumber VARCHAR(30),

        FoodHandlerCertExpiry DATE,
        TyphoidExpiry DATE,

        PasswordHash VARCHAR(255) NOT NULL,
        ResetToken VARCHAR(255) NULL,
        ResetExpiry DATETIME NULL,

        EmergencyContactName VARCHAR(100),
        EmergencyContactNumber VARCHAR(20),

        HourlyRate DECIMAL(10, 2) DEFAULT 15.00,

        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_employee_role
            FOREIGN KEY (RoleID)
            REFERENCES Role(RoleID)
    )";
    
    $conn->query($createTableSQL);
    echo "[✓] Created new Employee table with full schema\n";

    // Step 5: Migrate existing data
    $migratedCount = 0;
    foreach ($existingData as $emp) {
        $userId = intval($emp['UserID']);
        $roleId = intval($emp['RoleID'] ?? 2);
        $name = $conn->real_escape_string($emp['Name'] ?? 'Unknown');
        $email = $conn->real_escape_string($emp['Email'] ?? 'unknown@example.com');
        $contactNumber = $conn->real_escape_string($emp['ContactNumber'] ?? 'N/A');
        $hiringDate = $emp['HiringDate'] ?? date('Y-m-d');
        $passwordHash = $conn->real_escape_string($emp['PasswordHash'] ?? '');
        $resetToken = $emp['ResetToken'] ? "'" . $conn->real_escape_string($emp['ResetToken']) . "'" : 'NULL';
        $resetExpiry = $emp['ResetExpiry'] ? "'" . $conn->real_escape_string($emp['ResetExpiry']) . "'" : 'NULL';
        $hourlyRate = floatval($emp['HourlyRate'] ?? 15.00);

        // Generate unique IC number for migration (placeholder)
        $icNumber = 'IC' . str_pad($userId, 8, '0', STR_PAD_LEFT);
        
        // Default date of birth (placeholder)
        $dateOfBirth = '1990-01-01';

        $insertSQL = "INSERT INTO Employee (
            UserID, RoleID, Name, ICNumber, DateOfBirth, Gender, ContactNumber, Email,
            Position, EmploymentType, HiringDate, EmploymentStatus,
            BankName, BankAccountNumber,
            PasswordHash, ResetToken, ResetExpiry, HourlyRate, CreatedAt, UpdatedAt
        ) VALUES (
            $userId, $roleId, '$name', '$icNumber', '$dateOfBirth', 'Other', '$contactNumber', '$email',
            'Staff', 'Full-Time', '$hiringDate', 'Active',
            'N/A', 'N/A',
            '$passwordHash', $resetToken, $resetExpiry, $hourlyRate, NOW(), NOW()
        )";

        if ($conn->query($insertSQL)) {
            $migratedCount++;
        } else {
            echo "[!] Failed to migrate UserID $userId: " . $conn->error . "\n";
        }
    }
    echo "[✓] Migrated $migratedCount employee records\n";

    // Step 6: Re-enable foreign key checks
    $conn->query("SET FOREIGN_KEY_CHECKS = 1");
    echo "[✓] Re-enabled foreign key checks\n";

    echo "\n</pre>";
    echo "<h2 style='color: green;'>✓ Migration Complete!</h2>";
    echo "<p>Migrated $migratedCount employees. Backup saved to Employee_backup table.</p>";
    echo "<p><a href='debug_schema.php'>View new schema</a></p>";

} catch (Exception $e) {
    $conn->query("SET FOREIGN_KEY_CHECKS = 1");
    echo "\n[ERROR] " . $e->getMessage() . "\n";
    echo "</pre>";
    echo "<h2 style='color: red;'>✗ Migration Failed</h2>";
}

$conn->close();
?>

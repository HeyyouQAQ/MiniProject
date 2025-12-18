<?php
/**
 * Seed Test Users Script
 * Creates manager, hr, and staff accounts with password "123"
 */

require 'db_connect.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Seeding Test Users</h1>";
echo "<pre>";

// Step 1: Ensure all roles exist
$roles = [
    1 => 'Manager',
    2 => 'Staff', 
    3 => 'HR'
];

foreach ($roles as $id => $type) {
    $check = $conn->query("SELECT RoleID FROM Role WHERE RoleID = $id");
    if ($check->num_rows == 0) {
        $conn->query("INSERT INTO Role (RoleID, Type) VALUES ($id, '$type')");
        echo "[+] Created Role: $type (ID: $id)\n";
    } else {
        echo "[✓] Role exists: $type (ID: $id)\n";
    }
}

// Step 2: Define test users
$users = [
    [
        'roleId' => 1,
        'name' => 'manager',
        'icNumber' => '900101-01-0001',
        'dob' => '1990-01-01',
        'gender' => 'Male',
        'contact' => '012-1111111',
        'email' => 'manager@wcdonald.com',
        'position' => 'Manager',
        'bankName' => 'Maybank',
        'bankAccount' => '1234567890'
    ],
    [
        'roleId' => 3,
        'name' => 'hr',
        'icNumber' => '900202-02-0002',
        'dob' => '1990-02-02',
        'gender' => 'Female',
        'contact' => '012-2222222',
        'email' => 'hr@wcdonald.com',
        'position' => 'HR Officer',
        'bankName' => 'CIMB',
        'bankAccount' => '2345678901'
    ],
    [
        'roleId' => 2,
        'name' => 'staff',
        'icNumber' => '900303-03-0003',
        'dob' => '1990-03-03',
        'gender' => 'Male',
        'contact' => '012-3333333',
        'email' => 'staff@wcdonald.com',
        'position' => 'Crew Member',
        'bankName' => 'Public Bank',
        'bankAccount' => '3456789012'
    ]
];

// Step 3: Insert each user
foreach ($users as $user) {
    // Check if user already exists by email or name
    $stmt = $conn->prepare("SELECT UserID FROM Employee WHERE Email = ? OR Name = ?");
    $stmt->bind_param("ss", $user['email'], $user['name']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // Update existing user's password
        $row = $result->fetch_assoc();
        $updateStmt = $conn->prepare("UPDATE Employee SET PasswordHash = '123', RoleID = ? WHERE UserID = ?");
        $updateStmt->bind_param("ii", $user['roleId'], $row['UserID']);
        $updateStmt->execute();
        echo "[✓] Updated: {$user['name']} (Password: 123)\n";
    } else {
        // Insert new user
        $stmt = $conn->prepare("INSERT INTO Employee (
            RoleID, Name, ICNumber, DateOfBirth, Gender, ContactNumber, Email,
            Position, EmploymentType, HiringDate, EmploymentStatus,
            BankName, BankAccountNumber, PasswordHash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Full-Time', CURDATE(), 'Active', ?, ?, '123')");
        
        $stmt->bind_param("isssssssss", 
            $user['roleId'], $user['name'], $user['icNumber'], $user['dob'],
            $user['gender'], $user['contact'], $user['email'], $user['position'],
            $user['bankName'], $user['bankAccount']
        );
        
        if ($stmt->execute()) {
            echo "[+] Created: {$user['name']} (Password: 123)\n";
        } else {
            echo "[!] Failed to create {$user['name']}: " . $conn->error . "\n";
        }
    }
}

echo "\n</pre>";
echo "<h2 style='color: green;'>Done!</h2>";
echo "<table border='1' cellpadding='10'>";
echo "<tr><th>Username</th><th>Password</th><th>Role</th></tr>";
echo "<tr><td>manager</td><td>123</td><td>Manager</td></tr>";
echo "<tr><td>hr</td><td>123</td><td>HR</td></tr>";
echo "<tr><td>staff</td><td>123</td><td>Staff</td></tr>";
echo "</table>";

$conn->close();
?>

<?php
require 'db_connect.php';

echo "<h2>Seeding Default Users</h2>";

// Helper function to create/update user
function seedUser($conn, $name, $email, $roleType, $password)
{
    // Get RoleID
    $roleStmt = $conn->prepare("SELECT RoleID FROM Role WHERE Type = ?");
    $roleStmt->bind_param("s", $roleType);
    $roleStmt->execute();
    $roleRes = $roleStmt->get_result();

    if ($roleRow = $roleRes->fetch_assoc()) {
        $roleId = $roleRow['RoleID'];
    } else {
        // Create Role if missing (should be there from schema, but safety first)
        $conn->query("INSERT INTO Role (Type) VALUES ('$roleType')");
        $roleId = $conn->insert_id;
        echo "Created Role: $roleType<br>";
    }

    // Check if user exists (by Name or Email)
    $checkStmt = $conn->prepare("SELECT UserID FROM Employee WHERE Email = ? OR Name = ?");
    $checkStmt->bind_param("ss", $email, $name);
    $checkStmt->execute();

    // Hash password
    // NOTE: In production, use strong passwords. This is for local dev convenience as requested.
    $validPassword = $password; // "123"

    if ($checkStmt->get_result()->num_rows > 0) {
        // Update existing user
        $stmt = $conn->prepare("UPDATE Employee SET PasswordHash = ?, RoleID = ? WHERE Name = ? OR Email = ?");
        $stmt->bind_param("siss", $validPassword, $roleId, $name, $email);
        $stmt->execute();
        echo "Updated User: $name (Password set to '$password')<br>";
    } else {
        // Create new user
        $date = date('Y-m-d');
        $stmt = $conn->prepare("INSERT INTO Employee (Name, Email, PasswordHash, RoleID, HiringDate) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssis", $name, $email, $validPassword, $roleId, $date);
        $stmt->execute();
        echo "Created User: $name (Password: '$password')<br>";
    }
}

// Seed Users
// Admin -> Manager
seedUser($conn, 'admin', 'admin@wcdonald.com', 'Manager', '123');

// HR -> Manager (HR Dashboard logic is frontend role based, usually just Manager role in DB or specific HR role if schema supported it. 
// Based on App.tsx, HR is a role. But DB only has Manager/Worker default. 
// I will ensure 'HR' role exists or map it to Manager.
// App.tsx uses 'hr' string. Let's add 'HR' role to DB to be safe and clean.)
$conn->query("INSERT IGNORE INTO Role (Type) VALUES ('HR')");
seedUser($conn, 'hr', 'hr@wcdonald.com', 'HR', '123');

// Staff -> Staff
seedUser($conn, 'staff', 'staff@wcdonald.com', 'Staff', '123');

echo "<br><strong>Seeding Completed!</strong>";
?>
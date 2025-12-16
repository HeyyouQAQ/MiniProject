<?php
require 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

// Handle GET requests (Read & Verify Token)
if ($method == 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    if ($action == 'verify_token') {
        $token = $_GET['token'] ?? '';
        if (empty($token)) {
            echo json_encode(["valid" => false, "message" => "No token provided"]);
            exit;
        }

        $stmt = $conn->prepare("SELECT UserID, ResetExpiry, Name FROM Employee WHERE ResetToken = ?");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $res = $stmt->get_result();

        if ($row = $res->fetch_assoc()) {
            $now = new DateTime();
            $expiry = new DateTime($row['ResetExpiry']);

            if ($now > $expiry) {
                echo json_encode([
                    "valid" => false,
                    "message" => "Token expired. ServerTime: " . $now->format('Y-m-d H:i:s') . " Expiry: " . $expiry->format('Y-m-d H:i:s')
                ]);
            } else {
                echo json_encode(["valid" => true, "userName" => $row['Name']]);
            }
        } else {
            echo json_encode([
                "valid" => false,
                "message" => "Invalid token. Received: " . htmlspecialchars($token)
            ]);
        }
        exit;

    } elseif ($action == 'roles') {
        // Fetch Roles
        $sql = "SELECT RoleID, Type FROM Role";
        $result = $conn->query($sql);
        $roles = [];
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $roles[] = $row;
            }
        }
        echo json_encode($roles);

    } else {
        // List Employees
        $sql = "SELECT e.UserID, e.Name, e.Email, e.ContactNumber, e.HiringDate, r.Type as RoleName, e.RoleID 
                FROM Employee e 
                JOIN Role r ON e.RoleID = r.RoleID 
                ORDER BY e.HiringDate DESC";
        $result = $conn->query($sql);

        $employees = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $employees[] = [
                    'id' => $row['UserID'],
                    'fullName' => $row['Name'],
                    'email' => $row['Email'],
                    'role' => $row['RoleName'],
                    'roleId' => $row['RoleID'],
                    'contactNumber' => $row['ContactNumber'],
                    'hiringDate' => $row['HiringDate'],
                    'status' => 'Active'
                ];
            }
        }
        echo json_encode($employees);
    }

    // Handle POST requests (Create, Update, Set Password)
} elseif ($method == 'POST') {

    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE)
        $data = $_POST;

    if (empty($data)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "No data received."]);
        exit;
    }

    $action = $_GET['action'] ?? '';

    // ACTION: LOGIN
    if ($action == 'login') {
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Credentials required"]);
            exit;
        }

        // Allow login by Name or Email
        $stmt = $conn->prepare("SELECT e.UserID, e.Name, e.RoleID, e.PasswordHash, r.Type as RoleName 
                              FROM Employee e 
                              JOIN Role r ON e.RoleID = r.RoleID 
                              WHERE e.Name = ? OR e.Email = ?");
        $stmt->bind_param("ss", $username, $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            if ($password === $row['PasswordHash']) {
                echo json_encode([
                    "status" => "success",
                    "role" => strtolower($row['RoleName']), // 'manager', 'staff', 'hr'
                    "user" => [
                        "id" => $row['UserID'],
                        "name" => $row['Name']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Invalid password"]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "User not found"]);
        }
        exit;
    }

    // ACTION: FORGOT PASSWORD
    if ($action == 'forgot_password') {
        $email = $data['email'] ?? '';

        if (empty($email)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email required"]);
            exit;
        }

        // Check if user exists
        $stmt = $conn->prepare("SELECT UserID, Name FROM Employee WHERE Email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $res = $stmt->get_result();

        if ($row = $res->fetch_assoc()) {
            // Generate Token
            $token = bin2hex(random_bytes(32));
            $resetExpiry = date('Y-m-d H:i:s', strtotime('+24 hours'));

            // Update User
            $update = $conn->prepare("UPDATE Employee SET ResetToken = ?, ResetExpiry = ? WHERE UserID = ?");
            $update->bind_param("ssi", $token, $resetExpiry, $row['UserID']);
            $update->execute();

            // Simulate Email
            $link = "http://localhost:3000/MiniProject/?token=" . $token;
            $emailContent = "To: $email\nSubject: Password Reset Request\n\nHello " . $row['Name'] . ",\n\nWe received a request to reset your password.\nClick here to reset it:\n$link\n\n(Link expires in 24 hours)\n----------------------------------------------------\n\n";
            $logPath = __DIR__ . '/../../simulated_emails.txt';
            file_put_contents($logPath, $emailContent, FILE_APPEND);
        }

        // Always return success to prevent email enumeration
        echo json_encode(["status" => "success", "message" => "If an account matches that email, we have sent a reset link."]);
        exit;
    }

    // ACTION: SET PASSWORD
    if ($action == 'set_password') {
        $token = $data['token'] ?? '';
        $newPassword = $data['password'] ?? '';

        if (empty($token) || empty($newPassword)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Token and password required"]);
            exit;
        }

        // Validate Token
        $stmt = $conn->prepare("SELECT UserID, ResetExpiry FROM Employee WHERE ResetToken = ?");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            $expiry = new DateTime($row['ResetExpiry']);
            $now = new DateTime();

            if ($now > $expiry) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Link expired"]);
                exit;
            }

            // Update Password and Clear Token
            $updateStmt = $conn->prepare("UPDATE Employee SET PasswordHash = ?, ResetToken = NULL, ResetExpiry = NULL WHERE UserID = ?");
            $updateStmt->bind_param("si", $newPassword, $row['UserID']);

            if ($updateStmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Password set successfully"]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to update password"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid token"]);
        }
        exit;
    }

    // CREATE OR UPDATE EMPLOYEE
    if (isset($data['id']) && !empty($data['id'])) {
        $id = $data['id'];
        $name = $data['fullName'];
        $email = $data['email'];
        $roleId = $data['roleId'];
        $contact = $data['contactNumber'];

        // If password provided in update
        if (isset($data['password']) && !empty($data['password'])) {
            $sql = "UPDATE Employee SET Name=?, Email=?, RoleID=?, ContactNumber=?, PasswordHash=? WHERE UserID=?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssissi", $name, $email, $roleId, $contact, $data['password'], $id);
        } else {
            $sql = "UPDATE Employee SET Name=?, Email=?, RoleID=?, ContactNumber=? WHERE UserID=?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssisi", $name, $email, $roleId, $contact, $id);
        }

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Employee updated successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error updating: " . $conn->error]);
        }

    } else {
        // CREATE NEW EMPLOYEE
        if (empty($data['fullName']) || empty($data['email'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing required fields."]);
            exit;
        }

        $name = $data['fullName'];
        $email = $data['email'];
        $roleId = $data['roleId'] ?? 2;
        $contact = $data['contactNumber'] ?? '';
        $hiringDate = $data['hiringDate'] ?? date('Y-m-d');

        $password = $data['password'] ?? '';

        // TOKEN GENERATION LOGIC
        $token = null;
        $resetExpiry = null;

        if (empty($password)) {
            // Generate random token
            $token = bin2hex(random_bytes(32));
            $resetExpiry = date('Y-m-d H:i:s', strtotime('+24 hours'));
            $password = ''; // No password initially
        }

        // Check Duplicate (Email OR Name)
        $checkStmt = $conn->prepare("SELECT UserID FROM Employee WHERE Email = ? OR Name = ?");
        $checkStmt->bind_param("ss", $email, $name);
        $checkStmt->execute();
        if ($checkStmt->get_result()->num_rows > 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email or Username already exists"]);
            exit;
        }

        // Schema-Aware Insertion
        $columns = [];
        $res = $conn->query("DESCRIBE Employee");
        while ($r = $res->fetch_assoc())
            $columns[] = $r['Field'];

        $insertData = [];
        $types = "";

        // Function helper
        $add = function ($cols, $val, $type) use ($columns, &$insertData, &$types) {
            foreach ((array) $cols as $c) {
                if (in_array($c, $columns)) {
                    $insertData[$c] = $val;
                    $types .= $type;
                    return;
                }
            }
        };

        $add(['Name', 'FullName'], $name, 's');
        $add(['Email'], $email, 's');
        $add(['RoleID'], $roleId, 'i');
        $add(['ContactNumber'], $contact, 's');
        $add(['HiringDate'], $hiringDate, 's');
        $add(['Password', 'PasswordHash'], $password, 's');

        // Add Token columns if they exist
        if ($token) {
            $add(['ResetToken'], $token, 's');
            $add(['ResetExpiry'], $resetExpiry, 's');
        }

        $colsStr = implode(", ", array_keys($insertData));
        $placeholders = implode(", ", array_fill(0, count($insertData), "?"));

        $stmt = $conn->prepare("INSERT INTO Employee ($colsStr) VALUES ($placeholders)");
        $refs = [$types];
        foreach ($insertData as $key => $value)
            $refs[] = &$insertData[$key];
        call_user_func_array([$stmt, 'bind_param'], $refs);

        if ($stmt->execute()) {
            $newId = $conn->insert_id;

            // SIMULATE EMAIL
            if ($token) {
                $link = "http://localhost:3000/MiniProject/?token=" . $token;
                $emailContent = "To: $email\nSubject: Set your WcDonald's Password\n\nWelcome $name!\n\nPlease click the link below to set your password:\n$link\n\n(Link expires in 24 hours)\n----------------------------------------------------\n\n";
                // Relative path for portability (Up from /public/api/ to project root)
                $logPath = __DIR__ . '/../../simulated_emails.txt';
                file_put_contents($logPath, $emailContent, FILE_APPEND);
                echo json_encode(["status" => "success", "message" => "User created. Invitation sent (simulated).", "id" => $newId]);
            } else {
                echo json_encode(["status" => "success", "message" => "User created successfully.", "id" => $newId]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Insert failed: " . $stmt->error]);
        }
    }

    // Handle DELETE requests
} elseif ($method == 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ID required"]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM Employee WHERE UserID = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Employee deleted successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Delete failed: " . $conn->error]);
    }
}


$conn->close();
?>
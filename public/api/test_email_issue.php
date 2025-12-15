<?php
// Mock Request
$_SERVER['REQUEST_METHOD'] = 'POST';

// Mock Data
$_POST = [
    'fullName' => 'DebugUser_' . time(),
    'email' => 'debug_' . time() . '@test.com',
    'roleId' => '2',
    'contactNumber' => '555-0199',
    'hiringDate' => date('Y-m-d')
    // No password provided
];

// Capture Output
ob_start();
require 'users.php';
$output = ob_get_clean();

echo "Output: " . $output . "\n";

// Check simulated_emails.txt
$logPath = __DIR__ . '/../../simulated_emails.txt';
if (file_exists($logPath)) {
    echo "File content length: " . filesize($logPath) . "\n";
    $content = file_get_contents($logPath);
    if (strpos($content, $_POST['email']) !== false) {
        echo "SUCCESS: Email simulation found for " . $_POST['email'] . "\n";
    } else {
        echo "FAILURE: Email simulation NOT found for " . $_POST['email'] . "\n";
    }
} else {
    echo "FAILURE: simulated_emails.txt does not exist.\n";
}
?>

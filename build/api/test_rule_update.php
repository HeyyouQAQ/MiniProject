<?php
require_once 'db_connect.php';

function testConfigUpdate() {
    global $conn;

    echo "1. Fetching current config...\n";
    $_SERVER['REQUEST_METHOD'] = 'GET';
    // Capture output buffer
    ob_start();
    include 'config.php';
    $output = ob_get_clean();
    $data = json_decode($output, true);
    
    if (!isset($data['overtimeRules'])) {
        echo "FAIL: overtimeRules not found in response\n";
        return;
    }

    $firstRule = $data['overtimeRules'][0];
    echo "Current Rule 1 Factor: " . $firstRule['factor'] . "\n";
    
    // Modify it
    $newFactor = $firstRule['factor'] + 0.1;
    $firstRule['factor'] = $newFactor;
    $data['overtimeRules'][0] = $firstRule;

    echo "2. Updating config with new factor: $newFactor...\n";
    $_SERVER['REQUEST_METHOD'] = 'POST';
    // Mock input
    // We need to inject this into php://input so file_get_contents reads it. 
    // This is tricky in a script including another script. 
    // Instead we can modify config.php to accept a variable or use a stream wrapper.
    // EASIER: Just Use curl or similar, OR modify config.php slightly for testing? 
    // BETTER: Use stream wrapper for php://input
    
    // Actually, let's just use curl to the running server if possible. 
    // But we don't know if server is running on port 80 or 8080 or what. user said `npm run dev` but backend is likely on standard port 80/443 for XAMPP.
    // Let's assume localhost/MiniProject/public/api/config.php
    
    $url = "http://localhost/MiniProject/public/api/config.php";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Response: $response\n";
    
    if ($httpCode != 200) {
        echo "FAIL: HTTP $httpCode\n";
        // Attempt local include fallback if curl fails (e.g. no server running)
    }

    echo "3. Verifying update...\n";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    
    $newData = json_decode($response, true);
    if ($newData['overtimeRules'][0]['factor'] == $newFactor) {
        echo "SUCCESS: Factor updated to " . $newData['overtimeRules'][0]['factor'] . "\n";
    } else {
        echo "FAIL: Factor is " . $newData['overtimeRules'][0]['factor'] . ", expected $newFactor\n";
    }
}

testConfigUpdate();
?>

<?php
$url = 'http://localhost/MiniProjectyeow/MiniProject/public/api/users.php?action=salary_setup';
$data = [
    'user_id' => 11, // Staff
    'basic_salary' => 2500.00,
    'salary_per_hour' => 10.00,
    'fixed_allowance' => 150.00,
    'bank_name' => 'Maybank',
    'bank_account_number' => '1234567890',
    'epf_account_no' => 'EPF123',
    'tax_account_no' => 'TAX123',
    'default_special_leave_days' => 5
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-Requester-Role: HR',
    'X-Requester-ID: 10'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
?>

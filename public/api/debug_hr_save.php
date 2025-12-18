<?php
$url = 'http://localhost/MiniProjectyeow/MiniProject/public/api/users.php?action=salary_setup&requester_role=HR&requester_id=10&t=' . time(); // HR ID 10

$data = [
    'user_id' => 13, // Ahmad Faizal Bin Rosli
    'basic_salary' => '4200.00',
    'salary_per_hour' => '0.00',
    'fixed_allowance' => '300.00',
    'bank_name' => 'Maybank',
    'bank_account_number' => '164012345678',
    'epf_account_no' => '',
    'tax_account_no' => '',
    'default_special_leave_days' => '0'
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true // Fetch content even on 4xx/5xx
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "Response Code: " . $http_response_header[0] . "\n";
echo "Raw Response:\n" . $result . "\n";
?>

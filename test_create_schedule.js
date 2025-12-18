const http = require('http');

const postData = JSON.stringify({
    userId: 2,
    shiftDate: '2025-12-20',
    startTime: '08:00',
    endTime: '16:00',
    taskDescription: 'Test shift',
    status: 'Scheduled',
    createdBy: 1
});

const options = {
    hostname: 'localhost',
    port: 80,
    path: '/MiniProjectyeow/MiniProject/public/api/schedule.php?action=create_schedule',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    let data = '';
    console.log('STATUS:', res.statusCode);
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('RESPONSE:');
        console.log(data);
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
});

req.write(postData);
req.end();

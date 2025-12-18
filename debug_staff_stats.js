const http = require('http');

// Test with userId 2 (a staff user)
const options = {
    hostname: 'localhost',
    port: 80,
    path: '/MiniProjectyeow/MiniProject/public/api/staff_stats.php?userId=2',
    method: 'GET',
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

req.end();

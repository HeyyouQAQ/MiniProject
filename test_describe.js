const http = require('http');

const options = {
    hostname: 'localhost',
    port: 80,
    path: '/MiniProjectyeow/MiniProject/public/api/describe_schedule.php',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Response:');
        console.log(data);
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
});

req.end();

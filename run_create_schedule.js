const http = require('http');

const options = {
    hostname: 'localhost',
    port: 80,
    path: '/MiniProjectyeow/MiniProject/public/api/create_schedule_table.php',
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

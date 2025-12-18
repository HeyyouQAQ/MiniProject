const http = require('http');

const options = {
    hostname: 'localhost',
    port: 80,
    path: '/MiniProjectyeow/MiniProject/public/api/schedule.php?action=get_all_schedules',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Full response:');
        console.log(data);
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
});

req.end();

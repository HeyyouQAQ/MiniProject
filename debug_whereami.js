const http = require('http');

const options = {
    hostname: 'localhost',
    port: 80,
    path: '/MiniProjectyeow/MiniProject/public/api/whereami.php',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('BODY: ' + data);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();

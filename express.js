const express = require('express'); // 引入express模块

const app = express();
app.use(express.static('public'));
const server = require('http').createServer(app);// http

server.listen(3000);
// eslint-disable-next-line
console.log('3000');

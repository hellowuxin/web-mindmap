const express = require('express'); // 引入express模块
const fs = require('fs');

const app = express();
const server = require('http').createServer(app);// http

server.listen(80);

app.use(express.static('public'));
app.get('/data', (req, res) => {
  const data = JSON.parse(fs.readFileSync(`public/json/${req.query.filename}.json`));
  res.send(data);
});

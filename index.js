const http = require('http');
const fs = require('fs');

const app = http.createServer((request, response) => {
  let url = request.url;
  if (request.url == '/') {
    url = '/index.html';
  }
  if (request.url == '/favicon.ico') {
    response.writeHead(404);
    response.end();
    return;
  }
  response.writeHead(200);
  response.end(fs.readFileSync(__dirname + url));
});

app.listen(8080);

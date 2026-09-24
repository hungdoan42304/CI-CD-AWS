'use strict';

const http = require('node:http');

function createServer() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Hello from Jenkins CI/CD Build #2 - Webhook Success!\n');
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found\n');
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const server = createServer();

  server.listen(port, '0.0.0.0', () =>
    console.log(`Listening on ${port}`)
  );

  process.on('SIGTERM', () =>
    server.close(() => process.exit(0))
  );
}

module.exports = { createServer };

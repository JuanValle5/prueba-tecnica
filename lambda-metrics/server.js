const http = require('http');
const { handler } = require('./index');

const PORT = process.env.PORT || 8082;

const server = http.createServer(async (req, res) => {
  // Manejo de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP', service: 'aws-lambda-metrics-emulator' }));
    return;
  }

  if (req.url === '/metrics' || req.url === '/' || req.url.startsWith('/metrics?')) {
    try {
      const event = {
        httpMethod: req.method,
        path: req.url,
        headers: req.headers,
      };

      const result = await handler(event, {});
      res.writeHead(result.statusCode, result.headers);
      res.end(result.body);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal error', message: err.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`>>> [Local Lambda Emulator] Servidor escuchando en puerto ${PORT}`);
});

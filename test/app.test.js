'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createServer } = require('../app');

test('GET /health returns status ok', async () => {
  const server = createServer();

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const { port } = server.address();

    const response = await fetch(`http://127.0.0.1:${port}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { status: 'ok' });
  } finally {
    server.close();
    await once(server, 'close');
  }
});

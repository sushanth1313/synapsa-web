import { spawn } from 'child_process';

const server = spawn('node', ['server.js'], { stdio: 'inherit' });

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', text: 'Hello' }] })
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch(e) {
    console.error(e);
  }
  server.kill();
}, 2000);

const express = require('express');
const adminAuthRoutes = require('./routes/admin/adminAuthRoutes');

const app = express();
app.use(express.json());
app.use('/api/admin/auth', adminAuthRoutes);

const server = app.listen(0, async () => {
  const port = server.address().port;
  const http = require('http');

  function testLogin(email, password) {
    return new Promise((resolve) => {
      const postData = JSON.stringify({ email, password });
      const req = http.request('http://localhost:' + port + '/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, res => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          const parsed = JSON.parse(body);
          console.log('LOGIN [' + email + ']: STATUS', res.statusCode, '| SUCCESS:', parsed.success, '| NAME:', parsed.admin?.name);
          resolve();
        });
      });
      req.write(postData);
      req.end();
    });
  }

  await testLogin('admin@happysarees.com', 'Admin@2026');
  await testLogin('sumathi@happysarees.com', 'sumathi123');

  server.close();
  process.exit(0);
});

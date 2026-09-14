const express = require('express');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('SIT223 Student Task API is running');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP'
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    project: 'SIT223 Student Task API',
    version: '1.0.0',
    status: 'Running'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
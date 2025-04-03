const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Basic configuration
app.disable('x-powered-by');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to serve theme color
app.get('/api/theme', (req, res) => {
  res.json({ 
    primaryColor: '#1976D2',
    secondaryColor: '#64B5F6',
    backgroundColor: '#E3F2FD'
  });
});

// SPA catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cb.html'));
});

app.listen(PORT, () => {
  console.log(`Server running in blue theme on port ${PORT}`);
});


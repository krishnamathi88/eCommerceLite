const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Performance
app.disable('x-powered-by');
app.use(compression());
app.use(helmet());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// SPA catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cb.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server Error');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

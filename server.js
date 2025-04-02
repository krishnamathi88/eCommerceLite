const express = require('express');
const path = require('path');
// const compression = require('compression'); // Only uncomment after installing

const app = express();
const PORT = process.env.PORT || 3000;

// Basic setup without compression
app.use(express.static(path.join(__dirname, 'public')));
app.get('/:path(*)', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cb.html'));
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


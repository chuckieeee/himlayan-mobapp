const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@cemetery.com' && password === 'password123') {
    return res.json({ success: true, role: 'admin' });
  }

  res.status(401).json({ success: false });
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

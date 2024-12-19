const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 8000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000' // Specify the frontend port
}));
app.get('/', (req, res) => {
  res.send('Hello, World! This is your simple Express.js app.');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
  }

  if (username === "huydang" && password == "123")
  {
    res.json({ message: 'Login successful' });
  }
  else 
  {
    return res.status(401).send('login unsuccessfully');
  }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

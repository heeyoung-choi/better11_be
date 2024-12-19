const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8000;

// Middleware
app.use(bodyParser.json());

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
    return res.send('login successfully');
  }
  else 
  {
    return res.send('login unsuccessfully');
  }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

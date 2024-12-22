const express = require('express');
const admin = require('../firebaseAdmin'); // Import the shared Firebase Admin instance

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // check email in wrong format
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Fetch user by email
    const user = await admin.auth().getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Here, you would compare the password (use a secure method, e.g., bcrypt)

    // Generate a custom token to simulate a successful login
    const customToken = await admin.auth().createCustomToken(user.uid);

    res.json({
      message: 'Login successful',
      token: customToken,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Email, password, and display name are required.' });
  }

  try {
    // Create a new user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    res.json({
      message: 'User registered successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      },
    });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

module.exports = router;

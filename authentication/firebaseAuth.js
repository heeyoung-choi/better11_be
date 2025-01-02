const express = require('express');
const admin = require('../firebaseAdmin'); // Import the shared Firebase Admin instance

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Check email format
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Fetch user by email
    const user = await admin.auth().getUserByEmail(email);

    // Compare the password (use a secure hashing mechanism like bcrypt in production)
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate a custom token
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
    if (error.code === 'auth/user-not-found') {
      // Handle specific error when user is not found
      return res.status(401).json({ error: 'Invalid email or user does not exist.' });
    }

    // Log other errors and respond with a generic message
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
    // Create a new user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // Add the user to Firestore
    const db = admin.firestore();
    const userDoc = db.collection('users').doc(userRecord.uid);

    await userDoc.set({
      email: userRecord.email,
      displayName: userRecord.displayName,
      points: 0, // Initialize points to 0
      createdAt: new Date().toISOString(),
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

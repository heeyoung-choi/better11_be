const express = require('express');
const admin = require('../firebaseAdmin'); // Firebase Admin instance
const router = express.Router();

// Predict route
router.post('/predict', async (req, res) => {
  const { userId, matchId, type, data } = req.body;

  if (!userId || !matchId || !type || !data) {
    return res.status(400).json({ error: 'All fields (userId, matchId, type, data) are required.' });
  }

  try {
    const db = admin.firestore(); // Initialize Firestore
    const prediction = {
      userId,
      matchId,
      type,
      data,
      timestamp: new Date().toISOString(), // Add a timestamp
    };

    // Add prediction to Firestore
    await db.collection('predictions').add(prediction);

    res.json({ message: 'Prediction saved successfully', prediction });
  } catch (error) {
    console.error('Error saving prediction:', error.message);
    res.status(500).json({ error: 'Failed to save prediction' });
  }
});

// Retrieve all predictions for a specific user
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
  
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }
  
    try {
      const db = admin.firestore();
      const predictionsRef = db.collection('predictions');
      const querySnapshot = await predictionsRef.where('userId', '==', userId).get();
  
      if (querySnapshot.empty) {
        return res.status(404).json({ error: 'No predictions found for this user.' });
      }
  
      const predictions = [];
      querySnapshot.forEach((doc) => {
        predictions.push({
          id: doc.id, // Include the document ID for reference
          ...doc.data(), // Spread the document data
        });
      });
  
      res.json({ predictions });
    } catch (error) {
      console.error('Error retrieving predictions:', error.message);
      res.status(500).json({ error: 'Failed to retrieve predictions.' });
    }
  });

// Retrieve predictions for a specific user and match
router.get('/:userId/:matchId', async (req, res) => {
    const { userId, matchId } = req.params;
  
    if (!userId || !matchId) {
      return res.status(400).json({ error: 'Both userId and matchId are required.' });
    }
  
    try {
      const db = admin.firestore();
      const predictionsRef = db.collection('predictions');
      const querySnapshot = await predictionsRef
        .where('userId', '==', userId)
        .where('matchId', '==', matchId)
        .get();
  
      if (querySnapshot.empty) {
        return res.status(404).json({ error: 'No predictions found for this user and match.' });
      }
  
      const predictions = [];
      querySnapshot.forEach((doc) => {
        predictions.push({
          id: doc.id, // Include the document ID for reference
          ...doc.data(), // Spread the document data
        });
      });
  
      res.json({ predictions });
    } catch (error) {
      console.error('Error retrieving predictions:', error.message);
      res.status(500).json({ error: 'Failed to retrieve predictions.' });
    }
  });

module.exports = router;

const express = require('express');
const admin = require('../firebaseAdmin'); // Firebase Admin instance
const router = express.Router();
const axios = require('axios');
// API-Football configuration
const API_FOOTBALL_KEY = '6c4362965bmshc7357b4fd26115cp136a72jsnbea643c8c40d';
const API_FOOTBALL_BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3/';


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



router.get('/matches', async (req, res) => {
  try {
    const response = await axios.get(`${API_FOOTBALL_BASE_URL}fixtures`, {
      headers: {
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
        'x-rapidapi-key': API_FOOTBALL_KEY,
      },
      // Uncomment and adjust if you need specific parameters
      params: { date: '2025-01-01' },
    });

    console.log('API Response:', response.data);

    const matches = response.data.response;
    if (!matches || matches.length === 0) {
      return res.status(404).json({ error: 'No matches found.' });
    }

    res.json({ message: 'Matches retrieved successfully', matches });
  } catch (error) {
    console.error('Error fetching matches:', error.message);
    res.status(500).json({ error: 'Failed to fetch matches.' });
  }
});


// Get match result
router.get('/match-result/:matchId', async (req, res) => {
  const { matchId } = req.params;

  if (!matchId) {
    return res.status(400).json({ error: 'Match ID is required.' });
  }

  try {
    // Make API request to API-Football
    const response = await axios.get(`${API_FOOTBALL_BASE_URL}fixtures`, {
      headers: {
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
        'x-rapidapi-key': API_FOOTBALL_KEY,
      },
      params: { id: matchId }, // Match ID parameter
    });

    const fixture = response.data.response[0]; // Get the first (and only) match in the response

    if (!fixture) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    // Extract match result information
    const result = {
      matchId: fixture.fixture.id,
      status: fixture.fixture.status.long,
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      homeScore: fixture.goals.home,
      awayScore: fixture.goals.away,
    };

    res.json({ message: 'Match result retrieved successfully', result });
  } catch (error) {
    console.error('Error fetching match result:', error.message);
    res.status(500).json({ error: 'Failed to fetch match result.' });
  }
});

// Check if a user's prediction is correct
router.get('/check-prediction/:userId/:matchId', async (req, res) => {
  const { userId, matchId } = req.params;

  if (!userId || !matchId) {
    return res.status(400).json({ error: 'Both userId and matchId are required.' });
  }

  try {
    const db = admin.firestore();
    const predictionsRef = db.collection('predictions');

    // Fetch user's prediction
    const predictionSnapshot = await predictionsRef
      .where('userId', '==', userId)
      .where('matchId', '==', matchId)
      .limit(1)
      .get();

    if (predictionSnapshot.empty) {
      return res.status(404).json({ error: 'No prediction found for this user and match.' });
    }

    const prediction = predictionSnapshot.docs[0].data();

    // Fetch match result from API-Football
    const response = await axios.get(`${API_FOOTBALL_BASE_URL}fixtures`, {
      headers: {
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
        'x-rapidapi-key': API_FOOTBALL_KEY,
      },
      params: { id: matchId }, // Match ID parameter
    });

    const fixture = response.data.response[0];
    if (!fixture) {
      return res.status(404).json({ error: 'Match result not found.' });
    }

    // Extract match result
    const actualResult = {
      homeScore: fixture.goals.home,
      awayScore: fixture.goals.away,
      winner: fixture.teams.home.winner
        ? fixture.teams.home.name
        : fixture.teams.away.winner
        ? fixture.teams.away.name
        : 'Draw',
    };

    // Check if the match has already started or ended
    const matchStatus = fixture.fixture.status.long;
    if (matchStatus === 'Not Started') {
      return res.status(400).json({ error: 'Match has not started yet.' });
    }

    // Check if the prediction matches the actual result
    let isCorrect = false;

    if (prediction.type === 'winner') {
      const predictedWinner = prediction.data.predictedWinner || prediction.data; // Handle both object and string formats
      if (predictedWinner === 'Draw') {
        // Correct if the match result is a draw
        isCorrect = actualResult.homeScore === actualResult.awayScore;
      } else {
        // Correct if the predicted winner matches the actual winner
        isCorrect = predictedWinner === actualResult.winner;
      }
    }
     else if (prediction.type === 'score') {
      const predictedScores = JSON.parse(prediction.data); // Assumes prediction.data is a JSON string
      isCorrect =
        predictedScores.homeScore === actualResult.homeScore &&
        predictedScores.awayScore === actualResult.awayScore;
    }

    res.json({
      message: 'Prediction checked successfully',
      prediction,
      actualResult,
      isCorrect,
    });
  } catch (error) {
    console.error('Error checking prediction:', error.message);
    res.status(500).json({ error: 'Failed to check prediction.' });
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

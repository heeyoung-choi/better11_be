const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const loginRoute = require('./authentication/firebaseAuth'); // Import the login route
const predictionRoutes = require('./prediction/prediction'); // Import the prediction routes

const app = express();
const PORT = 8000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/auth', loginRoute); // Use the authentication routes with the '/auth' prefix
app.use('/predictions', predictionRoutes); // Use prediction routes

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

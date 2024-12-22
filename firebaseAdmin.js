const admin = require('firebase-admin');

// Path to your service account key JSON file
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;

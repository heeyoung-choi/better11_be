const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Manually verify the token or create a custom token for testing purposes
const authenticateUser = async () => {
  try {
    // Simulate a user authentication process by creating a custom token
    const uid = 'huydang'; // This UID can be any valid user UID
    const customToken = await admin.auth().createCustomToken(uid);

    console.log('Custom Token:', customToken);

    // You can use this custom token in your client app for testing purposes
  } catch (error) {
    console.error('Error creating custom token:', error);
  }
};

authenticateUser();

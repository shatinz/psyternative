import * as admin from 'firebase-admin';

// This is a server-only file.
let app: admin.app.App | undefined = undefined;

if (typeof window === 'undefined') { // Ensure this only runs on the server
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!admin.apps.length && serviceAccount) {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
    }
  } else if (admin.apps.length > 0) {
      app = admin.app();
  }
}

export const adminApp = app;

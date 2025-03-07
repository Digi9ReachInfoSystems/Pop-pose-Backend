const dotenv = require("dotenv");
dotenv.config();

const admin = require("firebase-admin");

if (!process.env.FIREBASE_CREDENTIALS) {
  console.error("Error: FIREBASE_CREDENTIALS is not defined in the .env file");
  process.exit(1); // Exit the process if the credentials are missing
}

if (!admin.apps.length) {
  const decodedServiceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_CREDENTIALS, "base64").toString("utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(decodedServiceAccount),
    storageBucket: process.env.FIREBASE_BUCKET_NAME,
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const bucket = admin.storage().bucket();
const storage = admin.storage().bucket();


module.exports = {
  admin,
  storage,
  bucket,

};

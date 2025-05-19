import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  // const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export { db };

/**
 * Updates multiple package documents in the "packages" collection in Firebase.
 * @param {Object} data - An object where keys are Firebase document IDs and values are package data objects to update.
 * @returns {Promise<void>} Resolves when all updates are complete.
 */
export const updateFirebaseData = async (data) => {
  try {
    // Iterate over the object
    for (const [firebaseId, packageData] of Object.entries(data)) {
      // Reference the document in Firebase by firebaseId
      const docRef = db.collection("packages").doc(firebaseId);

      // Update the document with the data
      await docRef.update(removeUndefined(packageData));

      console.log(`Document with ID ${firebaseId} updated successfully`);
    }
  } catch (error) {
    console.error("Error updating documents:", error);
  }
};

// Helper function to remove undefined properties from an object
function removeUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
}
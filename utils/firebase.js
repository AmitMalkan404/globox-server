import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export { db };

export const updateFirebaseData = async (data) => {
    try {
      // איטרציה על האובייקט
      for (const [firebaseId, packageData] of Object.entries(data)) {
        // הפניה למסמך ב-Firebase לפי firebaseId
        const docRef = db.collection("packages").doc(firebaseId);
  
        // עדכון המסמך עם הנתונים
        await docRef.update({
          address: packageData.address,
          coordinates: packageData.coordinates,
          status: packageData.status,
          postOfficeCode : packageData.postOfficeCode,
        });
  
        console.log(`Document with ID ${firebaseId} updated successfully`);
      }
    } catch (error) {
      console.error("Error updating documents:", error);
    }
  };

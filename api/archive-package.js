import { db } from "../utils/firebase";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const packageToArchive = req.body;

      // בדיקת קלט
      if (!packageToArchive.packageId) {
        return res.status(400).json({ error: "Invalid input." });
      }

      const packageId = packageToArchive.packageId;

      // שליפת המסמך לפי packageId
      const snapshot = await db
        .collection("packages")
        .where("packageId", "==", packageId)
        .get();

      // בדיקה אם המסמך קיים
      if (snapshot.empty) {
        console.log(`No document found with packageId: ${packageId}`);
        res.status(500).json({ error: `Package ${packageId} not found` });
        return;
      }

      // מחיקת כל המסמכים שמכילים את packageId (למקרה שיש יותר מאחד)
      snapshot.forEach(async (doc) => {
        
        // await db.collection("packages").doc(doc.id).delete(); // זה בשביל למחוק
        // res
        //   .status(200)
        //   .json({
        //     message: `Document with ID ${doc.id} and packageId ${packageId} deleted successfully.`,
        //   });

        const docRef = db.collection("packages").doc(doc.id); // בשביל לעדכן ל1-
        await docRef.update({ status: -1 }); // בשביל לעדכן ל1-
        res
          .status(200)
          .json({
            message: `Status for documents with packageId ${packageId} updated to -1.`,
          });
      });
    } catch (error) {
      console.error(`Error updating document ${firebaseId}:`, error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

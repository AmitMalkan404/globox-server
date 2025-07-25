import { db } from "../utils/firebase.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const packageToArchive = req.body;

      // בדיקת קלט
      if (!packageToArchive.packageId) {
        return res.status(400).json({ error: "Invalid input." });
      }

      const packageId = packageToArchive.packageId;
      const firebaseId = packageToArchive.firestoreId || "";

      // שליפת המסמך לפי packageId
      const snapshot = await db
        .collection("packages")
        .doc(firebaseId)
        .get();

      // בדיקה אם המסמך קיים
      if (snapshot.empty) {
        console.log(`No document found with packageId: ${packageId}`);
        res.status(500).json({ error: `Package ${packageId} not found` });
        return;
      }

      await db.collection("packages").doc(firebaseId).delete();
      res
          .status(200)
          .json({
            message: `Document with ID ${firebaseId} and packageId ${packageId} deleted successfully.`,
          });
    } catch (error) {
      console.error(`Error updating document ${firebaseId}:`, error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

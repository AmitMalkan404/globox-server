import { db } from "../utils/firebase";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const packageToArchive = req.body;

      // בדיקת קלט
      if (!packageToArchive.id) {
        return res.status(400).json({ error: "Invalid input." });
      }

      const firebaseId = packageToArchive.id;

      const docRef = db.collection("packages").doc(firebaseId); // קישור למסמך לפי firebaseId
      await docRef.update({ status: -1 });

      res
        .status(200)
        .json({ message: `Document ${firebaseId} status updated successfully` });
    } catch (error) {
      console.error(`Error updating document ${firebaseId}:`, error);
      res.status(500).json({ error: "Failed to update document" });
    }

  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

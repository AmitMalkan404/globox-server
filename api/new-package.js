import { db } from "../utils/firebase";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { packageId, address, description, postOfficeCode, status, coordinates, uid } = req.body;

    // בדיקת קלט
    if (!packageId || status < 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // שמירת המידע ב-Firestore
      const docRef = await db.collection("packages").add({
        packageId,
        address,
        description,
        status,
        coordinates,
        uid,
        postOfficeCode,
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({
        message: "Package added successfully!",
        firebaseId: docRef.id,
      });
    } catch (error) {
      console.error("Error saving shipment: ", error);
      res.status(500).json({ error: "Failed to save shipment" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

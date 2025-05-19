import { db } from "../utils/firebase";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const uid = req.body;
      const snapshot = await db
        .collection("packages")
        .where("uid", "==", uid)
        .orderBy("status")
        .get();

      // עיבוד המסמכים למערך
      const packages = snapshot.docs.map((doc) => ({
        id: doc.id, // ה-ID שנוצר על ידי Firebase
        ...doc.data(), // המידע במסמך
      }));

      res
        .status(200)
        .json({
          message: "success",
          "data-size": packages.length,
          data: packages,
        });
    } catch (error) {
      res
        .status(500)
        .json({ message: "error", error: "cannot fetch DB for packages" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

export default function handler(req, res) {
    if (req.method === "POST") {
      const { messages } = req.body;
  
      // בדיקת קלט
      if (!Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid input. Expected an array of messages." });
      }
  
      // חישוב כמות ההודעות
      const count = messages.length;
  
      // החזרת התוצאה
      res.status(200).json({ count });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  }
  
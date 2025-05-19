import { updatePackagesData } from "../utils/messageProcessUtils";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const messages = req.body;
      const updatedPackagesCount = await updatePackagesData(messages);

      res.status(200).json({
        res: `Packages updated successfully with ${updatedPackagesCount} packages`,
      });
    } catch (error) {
      console.error("Error occurred while processing packages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

import { updateUserPackagesFromMessages } from "../utils/messageProcessUtils";
import { trackingIdChanges } from "./../state/tracking-updates";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { uid, messages } = req.body;
      const updatedPackagesCount = await updateUserPackagesFromMessages(
        uid,
        messages
      );

      // Global variable to track changes to tracking IDs
      const trackingNumberChanges = [...trackingIdChanges];

      // Clear the tracking ID changes after processing
      trackingIdChanges.length = 0;

      res.status(200).json({
        res: `Packages updated successfully with ${updatedPackagesCount} packages`,
        trackingNumberChanges: trackingNumberChanges,
      });
    } catch (error) {
      console.error("Error occurred while processing packages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

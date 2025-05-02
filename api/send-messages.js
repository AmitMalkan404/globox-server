import { db, updateFirebaseData } from "../utils/firebase";
import { getLatLngWithBing } from "../utils/locationServiceUtils";
import { extractAddressAndLocalCodeFromMessage } from "../utils/locationServiceUtils";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const snapshot = await db.collection("packages").get();

      // Process documents into an array
      const packages = snapshot.docs.map((doc) => ({
        id: doc.id, // Firebase-generated ID
        ...doc.data(), // Document data
      }));

      const messages = req.body;

      // Input validation
      if (!Array.isArray(messages)) {
        return res
          .status(400)
          .json({ error: "Invalid input. Expected an array of messages." });
      }

      const filteredPackages = packages.filter(
        (pckg) => pckg.coordinates?.length === 0
      );

      const filteredMessages = mapMessagesWithFirebaseId(
        filteredPackages,
        messages
      );

      const updatedPackages = {};

      for (const pckg of filteredMessages) {
        // Skip if the package already has an address
        if (updatedPackages[pckg.firebaseId]?.address?.length > 0) {
          console.log(
            `Skipping package ${pckg.firebaseId} as it already has an address.`
          );
          continue;
        }

        const addressAndInternalCode =
          await extractAddressAndLocalCodeFromMessage(pckg.message);

        if (addressAndInternalCode.address) {
          // If address is found
          var latLng = await getLatLngWithBing(addressAndInternalCode.address);
        }

        updatedPackages[pckg.firebaseId] = {
          address: addressAndInternalCode.address || "",
          coordinates: addressAndInternalCode.address ? latLng : [],
          pickupPointName: addressAndInternalCode.pickupPoint || "",
          status: addressAndInternalCode.address ? 2 : 1,
          postOfficeCode: addressAndInternalCode.internalCode || "",
        };
      }

      await updateFirebaseData(updatedPackages);

      res.status(200).json({
        res: `Packages updated successfully with ${
          Object.keys(updatedPackages).length
        } packages`,
      });
    } catch (error) {
      console.error("Error occurred while processing packages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

export const mapMessagesWithFirebaseId = (packages, messages) => {
  // Extract packageIds from packages along with Firebase IDs
  const packageMap = packages.reduce((map, pkg) => {
    map[pkg.packageId] = pkg.id; // Store firebaseId by packageId
    return map;
  }, {});

  // Map messages with the corresponding firebaseId
  return messages
    .filter((message) =>
      Object.keys(packageMap).some((id) => message.includes(id))
    )
    .map((message) => {
      const matchedId = Object.keys(packageMap).find((id) =>
        message.includes(id)
      );
      return {
        firebaseId: packageMap[matchedId], // Corresponding Firebase ID
        message, // Original message
      };
    });
};

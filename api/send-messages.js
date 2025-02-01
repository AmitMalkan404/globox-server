import { db, updateFirebaseData } from "../utils/firebase";
import {
  extractAddressFromText,
  getLatLngWithBing,
} from "../utils/locationServiceUtils";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const snapshot = await db.collection("packages").get();

    // עיבוד המסמכים למערך
    const packages = snapshot.docs.map((doc) => ({
      id: doc.id, // ה-ID שנוצר על ידי Firebase
      ...doc.data(), // המידע במסמך
    }));

    const messages = req.body;

    // בדיקת קלט
    if (!Array.isArray(messages)) {
      return res
        .status(400)
        .json({ error: "Invalid input. Expected an array of messages." });
    }

    let filteredPackages = packages.filter((pckg) => {
      return pckg.coordinates?.length === 0;
    });

    const filteredMessages = mapMessagesWithFirebaseId(
      filteredPackages,
      messages
    );

    var updatedPackages = {};

    try {
      for (const pckg of filteredMessages) {
        // if the package has an address then no need to check further
        if (
          updatedPackages[pckg.firebaseId] &&
          updatedPackages[pckg.firebaseId].address &&
          updatedPackages[pckg.firebaseId].address.length > 0
        ) {
          console.log(
            `Skipping package ${pckg.firebaseId} as it already has an address.`
          );
          continue;
        }
        let addressRes = extractAddressFromText(pckg.message);

        // if arrived
        if (addressRes.contains_address) {
          updatedPackages[pckg.firebaseId] = {
            address: addressRes.address,
            coordinates: [],
            status: 2,
          };
        } else {
          // if not Arrived yet
          updatedPackages[pckg.firebaseId] = {
            address: "",
            coordinates: [],
            status: 1,
          };
        }
      }

      for (const packageId in updatedPackages) {
        let pckg = updatedPackages[packageId];

        // if there is no address or coordinates already exist
        if (pckg.address === "" || pckg.coordinates.length === 2) continue;
        let latLng = await getLatLngWithBing(pckg.address);
        updatedPackages[packageId].coordinates = latLng;
      }
    } catch (error) {
      console.error("Error Fetching Lat Lng of address: ", error);
    }

    await updateFirebaseData(updatedPackages);

    res.status(200).json({
      res: `packages updated successfully with ${
        Object.keys(updatedPackages).length
      } packages`,
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

export const mapMessagesWithFirebaseId = (packages, messages) => {
  // שליפת packageIdים מתוך החבילות יחד עם ה-Firebase ID
  const packageMap = packages.reduce((map, pkg) => {
    map[pkg.packageId] = pkg.id; // שמירת firebaseId לפי packageId
    return map;
  }, {});

  // מיפוי ההודעות עם ה-firebaseId המתאים
  return messages
    .filter((message) => {
      // בדיקה אם ההודעה מכילה packageId כלשהו
      return Object.keys(packageMap).some((id) => message.includes(id));
    })
    .map((message) => {
      // הוספת ה-firebaseId להודעה
      const matchedId = Object.keys(packageMap).find((id) =>
        message.includes(id)
      );
      return {
        firebaseId: packageMap[matchedId], // ה-Firebase ID המתאים
        message, // ההודעה המקורית
      };
    });
};

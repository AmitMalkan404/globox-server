import { db } from "../utils/firebase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    packageId,
    address,
    description,
    postOfficeCode,
    pickupPointName,
    status,
    coordinates,
    uid,
    eStatus,
    statusDesc,
    statusDetailedDesc,
    time,
    actionCode,
    contact,
    contactDetails,
    originCountry,
    destCountry,
  } = req.body;

  if (!packageId) {
    return res
      .status(400)
      .json({ error: "Missing or invalid required fields" });
  }

  const packageData = {
    packageId: packageId || "",
    address: address || "",
    description: description || "",
    postOfficeCode: postOfficeCode || "",
    pickupPointName: pickupPointName || "",
    status: typeof status === "number" ? status : -1,
    coordinates: coordinates || [],
    uid: uid || "",
    eStatus: eStatus || "",
    statusDesc: statusDesc || "",
    statusDetailedDesc: statusDetailedDesc || "",
    time: time || 0,
    actionCode: actionCode || "",
    contact: contact || "",
    contactDetails: contactDetails || "",
    originCountry: originCountry || "",
    destCountry: destCountry || "",
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await db.collection("packages").add(packageData);

    return res.status(201).json({
      message: "Package added successfully!",
      firebaseId: docRef.id,
    });
  } catch (error) {
    console.error("❌ Error saving shipment:", error);
    return res.status(500).json({ error: "Failed to save shipment" });
  }
}

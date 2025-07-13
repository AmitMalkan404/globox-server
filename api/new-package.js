import { db } from '../utils/firebase.js';
import { processPackagesWithMessages } from "../utils/messageProcessUtils.js";

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
    arrivalMsg: "",
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await db.collection("packages").add(packageData);
    await processPackagesWithMessages([{ ...packageData, id: docRef.id }], []);
    return res.status(201).json({
      message: "Package added successfully!",
      firebaseId: docRef.id,
    });
  } catch (error) {
    console.error("❌ Error saving shipment:", error);
    return res.status(500).json({ error: "Failed to save shipment" });
  }
}

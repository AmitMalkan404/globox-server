import { db, updateFirebaseData } from "../utils/firebase";
import { getLatLngWithBing } from "../utils/locationServiceUtils";
import { extractAddressAndLocalCodeFromMessage } from "../utils/locationServiceUtils";
import { getPackageDeliveryStatus } from "../utils/packagesUtils";

const updatedPackages = {};

/**
 * Updates package data in Firebase based on an array of messages.
 * Extracts address and coordinates from messages and updates the corresponding packages.
 * @param {string[]} messages - Array of message strings to process.
 * @returns {Promise<number>} The number of updated packages.
 */
export const updatePackagesData = async (messages) => {
  const snapshot = await db.collection("packages").get();

  // Process documents into an array
  const packages = snapshot.docs.map((doc) => ({
    id: doc.id, // Firebase-generated ID
    ...doc.data(), // Document data
  }));

  // Input validation
  if (!Array.isArray(messages)) {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected an array of messages." });
  }

  const filteredPackages = packages.filter(
    (pckg) => pckg.coordinates?.length === 0 || pckg.coordinates?.length === 2
  );

  const filteredMessages = mapMessagesWithFirebaseId(
    filteredPackages,
    messages
  );

  for (const pckg of filteredMessages) {
    // Skip if the package already has an address
    if (updatedPackages[pckg.firebaseId]?.address?.length > 0) {
      console.log(
        `Skipping package ${pckg.firebaseId} as it already has an address.`
      );
      continue;
    }
    await updatePackageDataFromMessage(pckg.message, pckg.firebaseId);
    const deliveryStatus = await getPackageDeliveryStatus(pckg.packageId);

    updatedPackages[pckg.firebaseId] = {
      ...(updatedPackages[pckg.firebaseId] || {}),
      ...deliveryStatus,
    };
  }

  await updateFirebaseData(updatedPackages);
  
  return updateFirebaseData.length;
};

/**
 * Updates a single package's data from a message.
 * Extracts address, coordinates, pickup point, and post office code from the message.
 * @param {string} message - The message containing package info.
 * @param {string} firebaseId - The Firebase document ID for the package.
 * @returns {Promise<void>} Resolves when the update is complete.
 */
export const updatePackageDataFromMessage = async (message, firebaseId) => {
  const addressAndInternalCode = await extractAddressAndLocalCodeFromMessage(
    message
  );

  if (addressAndInternalCode.address) {
    // If address is found
    var latLng = await getLatLngWithBing(addressAndInternalCode.address);
  }

  updatedPackages[firebaseId] = {
    address: addressAndInternalCode.address || "",
    coordinates: addressAndInternalCode.address ? latLng : [],
    pickupPointName: addressAndInternalCode.pickupPoint || "",
    postOfficeCode: addressAndInternalCode.internalCode || "",
  };
};

/**
 * Maps messages to their corresponding Firebase package IDs.
 * @param {Object[]} packages - Array of package objects from Firebase.
 * @param {string[]} messages - Array of message strings.
 * @returns {Array<{firebaseId: string, packageId: string, message: string}>} 
 *   An array of objects, each containing the Firebase ID, package ID, and the original message.
 */
export const mapMessagesWithFirebaseId = (packages, messages) => {
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
        packageId: matchedId, // Package ID
        message, // Original message
      };
    });
};

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
export const updatePackagesData = async (uid, messages) => {
  const snapshot = await db
    .collection("packages")
    .where("uid", "==", uid)
    .get();

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

  const filteredMessages = mapMessagesWithFirebaseId(packages, messages);

  for (const pckg of filteredMessages) {
    // Skip if the package already has an address
    if (updatedPackages[pckg.firebaseId]?.address?.length > 0) {
      console.log(
        `Skipping package ${pckg.firebaseId} as it already has an address.`
      );
      continue;
    }
    if (pckg.message) await updatePackageDataFromMessage(pckg.message, pckg.firebaseId);
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
    arrivalMsg: addressAndInternalCode.address? message: "",
  };
};

/**
 * Maps each package from Firebase to its corresponding message by matching the packageId within the message text.
 * @param {Object[]} packages - Array of package objects from Firebase, each containing at least an id and packageId.
 * @param {string[]} messages - Array of message strings to search for package IDs.
 * @returns {Array<{firebaseId: string, packageId: string, message: string|null}>} An array of objects, each containing the Firebase ID, package ID, and the matched message (or null if not found).
 */
export const mapMessagesWithFirebaseId = (packages, messages) => {
  const packageMap = packages.reduce((map, pkg) => {
    map[pkg.packageId] = pkg.id;
    return map;
  }, {});

  return packages.map((pkg) => {
    const matchingMessage = messages.find((message) =>
      message.includes(pkg.packageId)
    );

    return {
      firebaseId: pkg.id,
      packageId: pkg.packageId,
      message: matchingMessage || null,
    };
  });
};

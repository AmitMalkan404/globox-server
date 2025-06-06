import { db, updateFirebaseData } from "../utils/firebase";
import { getLatLngWithBing } from "../utils/locationServiceUtils";
import { extractAddressAndLocalCodeFromMessage } from "../utils/locationServiceUtils";
import { getPackageDeliveryStatus } from "../utils/packagesUtils";

const updatedPackages = {};

/**
 * Updates all packages for a specific user based on an array of messages.
 * Fetches all packages for the given user ID, matches each package to a message,
 * extracts address and coordinates, and updates the corresponding package records.
 * @param {string} uid - The user ID whose packages should be updated.
 * @param {string[]} messages - Array of message strings to process.
 * @returns {Promise<number>} The number of updated packages.
 */
export const updateUserPackagesFromMessages = async (uid, messages) => {
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

  return processPackagesWithMessages(packages, messages);
};

/**
 * Processes and updates multiple packages with the latest message and delivery status information.
 *
 * This function maps messages to their corresponding packages, updates package data
 * from messages if necessary, retrieves the latest delivery status, and updates the
 * package data in Firebase. It is designed for multiusage scenarios where multiple
 * packages and messages need to be processed in bulk.
 *
 * @async
 * @param {Array<Object>} packages - The list of package objects to be updated.
 * @param {Array<Object>} messages - The list of message objects to be mapped and processed.
 * @returns {Promise<number>} The number of packages updated.
 */
export const processPackagesWithMessages = async (packages, messages) => {
  const filteredMessages = mapMessagesWithFirebaseId(packages, messages);

  for (const pckg of filteredMessages) {
    // Skip if the package already has an address
    if (
      updatedPackages[pckg.firebaseId]?.address?.length > 0 &&
      updatedPackages[pckg.firebaseId]?.coordinates?.length > 0
    ) {
      console.log(
        `Skipping package ${pckg.firebaseId} as it already has an address.`
      );
      continue;
    }
    if (pckg.message)
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
export const updatePackageDataFromMessage = async (rawMessage, firebaseId) => {
  const message = cleanDeliveryMessage(rawMessage);
  const addressAndInternalCode = await extractAddressAndLocalCodeFromMessage(
    message
  );

  if (addressAndInternalCode.address) {
    // If address is found
    var latLng = await getLatLngWithBing(addressAndInternalCode.address);
  }

  updatedPackages[firebaseId] = {};
  if (addressAndInternalCode.address) {
    updatedPackages[firebaseId].address = addressAndInternalCode.address;
    updatedPackages[firebaseId].arrivalMsg = message;
  }
  if (latLng && latLng.length > 0) {
    updatedPackages[firebaseId].coordinates = latLng;
  }
  if (addressAndInternalCode.pickupPoint) {
    updatedPackages[firebaseId].pickupPointName =
      addressAndInternalCode.pickupPoint;
  }
  if (addressAndInternalCode.internalCode) {
    updatedPackages[firebaseId].postOfficeCode =
      addressAndInternalCode.internalCode;
  }
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

/**
 * Cleans a delivery message by removing asterisks, underscores, and emojis,
 * normalizing multiple spaces to a single space, and trimming whitespace.
 *
 * @param {string} raw - The raw message string to be cleaned.
 * @returns {string} The cleaned message string.
 */
export function cleanDeliveryMessage(raw) {
  return (
    raw
      // Remove asterisks and underscores
      .replace(/[*_]/g, "")
      // Remove emojis (Unicode emoji range)
      .replace(
        /[\u{1F300}-\u{1FAD6}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu,
        ""
      )
      // Normalize multiple spaces to a single space
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}

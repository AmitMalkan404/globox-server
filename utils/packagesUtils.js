import { trackingIdChanges } from './../state/tracking-updates.js';


/**
 * Fetches the delivery status of a package from the Cainiao global tracking API.
 * Recursively checks for updated tracking numbers and limits retry attempts.
 * @param {string} packageId - The package tracking number.
 * @param {number} [depth=0] - Internal use for recursion depth.
 * @returns {Promise<Object>} An object containing the package's delivery status and related information.
 * @throws Will throw an error if the API request fails, the response is invalid, or maximum retries are exceeded.
 */
export async function getPackageDeliveryStatus(packageId, depth = 0) {
  if (depth > 3) {
    throw new Error("Exceeded maximum retry attempts for package tracking");
  }
  try {
    const res = await fetch(
      `https://global.cainiao.com/global/detail.json?mailNos=${packageId}&lang=en-US&language=en-US`
    );
    const data = await res.json();

    var traceInfo = {};
    const module = data?.module?.[0];

    const newPackageID = checkIfTrackingNumberUpdated(module, packageId);
    if (newPackageID) {
      return await getPackageDeliveryStatus(newPackageID);
    }

    const latestTrace = module?.latestTrace;

    // Extract fields from latestTrace
    if (module.mailNoSource === "EXTERNAL") {
      traceInfo.eStatus = "ERROR";
      traceInfo.statusDesc =
        "External Package - No tracking information available";
    } else {
      traceInfo = {
        packageId: newPackageID || packageId,
        eStatus: module?.status || "",
        statusDesc: latestTrace?.desc || "",
        statusDetailedDesc: latestTrace?.standerdDesc || "",
        time: latestTrace?.time || 0,
        actionCode: latestTrace?.actionCode || null,
        contact: module?.destCpInfo?.cpName || null,
        contactDetails: module?.destCpInfo?.phone || null,
        originCountry: module?.originCountry || null,
        destCountry: module?.destCountry || null,
      };
    }

    return traceInfo;
  } catch (error) {
    console.error("Error fetching package delivery status:", error);
    throw new Error("Failed to fetch package delivery status");
  }
}

/**
 * Checks if the tracking number (copyRealMailNo) in the given module has been updated compared to the provided packageId.
 * If updated, logs the change, records it in trackingIdChanges, and returns the new tracking number.
 *
 * @param {Object} module - The module object containing tracking information.
 * @param {string} packageId - The original package tracking number.
 * @returns {string|null} The updated tracking number if changed, otherwise null.
 */
export const checkIfTrackingNumberUpdated = (module, packageId) => {
  if (module.copyRealMailNo && module.copyRealMailNo !== packageId) {
    console.log(
      `Tracking number updated from ${packageId} to ${module.copyRealMailNo}`
    );
    trackingIdChanges.push({
      oldPackageId: packageId,
      newPackageId: module.copyRealMailNo,
    });
    return module.copyRealMailNo;
  }
  return null;
};


export const checkIfPackageIdExistsInDatabase = async (packageId) => {
  try {
    const snapshot = await db
      .collection("packages")
      .where("packageId", "==", packageId)
      .get();

    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking package ID in database:", error);
    throw new Error("Database query failed");
  }
}
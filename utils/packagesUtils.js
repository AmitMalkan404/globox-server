/**
 * Fetches the delivery status of a package from the Cainiao global tracking API.
 * @param {string} packageId - The package tracking number.
 * @returns {Promise<Object>} An object containing the package's delivery status and related information.
 *   If the package is external, returns an error status and description.
 * @throws Will throw an error if the API request fails or the response is invalid.
 */
export async function getPackageDeliveryStatus(packageId) {
  try {
    const res = await fetch(
      `https://global.cainiao.com/global/detail.json?mailNos=${packageId}&lang=en-US&language=en-US`
    );
    const data = await res.json();

    var traceInfo = {};
    const module = data?.module?.[0];

    const latestTrace = module?.latestTrace;

    // Extract fields from latestTrace
    if (module.mailNoSource === "EXTERNAL") {
      traceInfo.eStatus = "ERROR";
      traceInfo.statusDesc = "External Package - No tracking information available";
    } else {
      traceInfo = {
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

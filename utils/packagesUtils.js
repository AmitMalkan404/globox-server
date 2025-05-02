export function extractInternalCode(text) {
  const pattern = /([א-ת])\s?(\d{1,5})/g;
  const matches = [...text.matchAll(pattern)];

  if (matches.length > 0) {
    const letter = matches[0][1];
    const number = matches[0][2];
    return `${letter} ${number}`;
  }

  return null;
}

export async function getPackageDeliveryStatus(packageId) {
  try {
  const res = await fetch(`https://global.cainiao.com/global/detail.json?mailNos=${packageId}&lang=en-US&language=en-US`)
  const data = await res.json();
  return data;
  } catch (error) {
    console.error("Error fetching package delivery status:", error);
    throw new Error("Failed to fetch package delivery status");
  }
}
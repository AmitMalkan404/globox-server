export function extractAddressFromText(message) {
  // Regex strictly for Hebrew street -> number -> city
  const cleanedMessage = cleanGenericWords(message)

  const addressPattern = /([א-ת\s]+?)\s(\d+),?\s([א-ת\s]+?)(?=$|[\n.,])/g;
  let match;

  while ((match = addressPattern.exec(cleanedMessage)) !== null) {
    const street = match[1].trim();
    const number = match[2].trim();
    const city = match[3].trim();

    // Validate components to ensure it's a proper address
    if (street && number && city) {
      return {
        contains_address: true,
        address: `${street} ${number}, ${city}`,
      };
    }
  }

  return {
    contains_address: false,
    address: null,
  };
}

function cleanGenericWords(text) {
  const genericWords = [
    'חנות', 'סניף', 'ליד', 'מול', 'תחנת דלק',
    'מרכז', 'בניין', 'קניון', 'מכולת'
  ];

  const pattern = new RegExp(`(?:${genericWords.join('|')})\\s`, 'g');
  return text.replace(pattern, '');
}

export async function getLatLngWithBing(addressName) {
  try {
    const response = await fetch(
      `http://dev.virtualearth.net/REST/v1/Locations?q=${encodeURIComponent(addressName)}&key=${process.env.BING_MAP_API}`
    );
    const data = await response.json(); // ניתוח התגובה לפורמט JSON

    // בדיקה אם יש תוצאות
    if (data.resourceSets?.[0]?.estimatedTotal > 0) {
      return data.resourceSets[0].resources[0].point.coordinates; // החזרת הקואורדינטות
    }
    return []; // אין תוצאות
  } catch (error) {
    throw `Cannot fetch geo location from external API (Bing). Please try again later. Further details: ${error}`;
  }
}

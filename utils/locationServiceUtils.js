export function extractAddressFromText(message) {
  // Regex strictly for Hebrew street -> number -> city
  const cleanedMessage = cleanGenericWords(message);

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
    "חנות",
    "סניף",
    "ליד",
    "מול",
    "תחנת דלק",
    "מרכז",
    "בניין",
    "קניון",
    "מכולת",
  ];

  const pattern = new RegExp(`(?:${genericWords.join("|")})\\s`, "g");
  return text.replace(pattern, "");
}

/**
 * Retrieves latitude and longitude coordinates for a given address using the Bing Maps API.
 * @param {string} addressName - The address to geocode.
 * @returns {Promise<number[]>} An array containing [latitude, longitude] if found, or an empty array if not found.
 * @throws Will throw an error if the Bing Maps API request fails.
 */
export async function getLatLngWithBing(addressName) {
  try {
    const response = await fetch(
      `http://dev.virtualearth.net/REST/v1/Locations?q=${encodeURIComponent(
        addressName
      )}&key=${process.env.BING_MAP_API}`
    );
    const data = await response.json();

    if (data.resourceSets?.[0]?.estimatedTotal > 0) {
      return data.resourceSets[0].resources[0].point.coordinates;
    }
    return []; 
  } catch (error) {
    throw `Cannot fetch geo location from external API (Bing). Please try again later. Further details: ${error}`;
  }
}

/**
 * Retrieves the latitude and longitude for a given address using the OpenCage Geocoding API.
 *
 * @async
 * @param {string} addressName - The address to geocode.
 * @returns {Promise<number[]>} A promise that resolves to an array containing [latitude, longitude] if found, or an empty array if not found or on error.
 */
export async function getLatLngWithOpenCage(addressName) {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    addressName
  )}&key=${process.env.OPEN_CAGE_API_KEY}&language=he`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return [lat, lng];
    } else {
      return [];
    }
  } catch (err) {
    console.error("שגיאה ב־OpenCage:", err);
    return [];
  }
}


/**
 * Extracts address, internal code, and pickup point from a message using the Groq API.
 * @param {string} message - The message to analyze.
 * @returns {Promise<{address: string|null, internalCode: string|null, pickupPoint: string|null}>}
 *   An object containing the extracted address, internal code, and pickup point (all may be null if not found).
 * @throws Will throw an error if the Groq API request fails or the response is invalid.
 */
export async function extractAddressAndLocalCodeFromMessage(message) {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: process.env.GROQ_SYSTEM_ROLE_CONTENT },
          { role: "user", content: message },
        ],
      }),
    });
    const data = await res.json();

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in response from Groq");
    }

    // Remove code block markers and trim whitespace
    const cleanContent = content.replace(/```(\w*\n)?|```/g, "").trim();
    const parsed = JSON.parse(cleanContent);

    return {
      address: parsed.address || null,
      internalCode: parsed.internalCode || null,
      pickupPoint: parsed.pickupPoint || null,
    };
  } catch (error) {
    console.error("Error fetching address and local code:", error);
    throw new Error("Failed to fetch address and local code:", error);
  }
}

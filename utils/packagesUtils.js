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
  
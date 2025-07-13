import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' }); // טוען את הקובץ הספציפי לבדיקה

import { getLatLngWithOpenCage } from './getLatLng.js';

describe('getLatLngWithOpenCage', () => {
  it('should return coordinates for a real address', async () => {
    const coords = await getLatLngWithOpenCage('רחוב הארבעה 10 תל אביב');
    expect(coords.length).toBe(2);
    expect(typeof coords[0]).toBe('number');
  });

  it('should return [] for invalid address', async () => {
    const coords = await getLatLngWithOpenCage('כתובת שלא קיימת ביבשת');
    expect(coords).toEqual([]);
  });
});

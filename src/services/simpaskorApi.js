import axios from 'axios';

const SIMPASKOR_API_URL = 'https://simpaskor.id/api/landing_page.php';

/**
 * Fetch jadwal/events dari Simpaskor API
 */
export const getSimpaskorSchedule = async () => {
  try {
    const response = await axios.get(SIMPASKOR_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching Simpaskor schedule:', error);
    throw error;
  }
};

/**
 * Parse data jadwal dari response API
 * Sesuaikan dengan struktur data yang dikembalikan dari API
 */
export const parseSimpaskorSchedule = (data) => {
  // Implementasi parsing sesuai struktur data dari API
  // Contoh jika data berupa array events:
  if (Array.isArray(data)) {
    return data;
  }
  
  // Jika data punya property tertentu, sesuaikan:
  if (data?.events) {
    return data.events;
  }
  
  if (data?.schedule) {
    return data.schedule;
  }
  
  return data;
};

export default {
  getSimpaskorSchedule,
  parseSimpaskorSchedule
};

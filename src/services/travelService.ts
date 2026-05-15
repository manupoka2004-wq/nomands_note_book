export interface LandmarkInfo {
  title: string;
  extract: string;
  thumbnail?: string;
  pageid: number;
}

export const getLandmarkDetails = async (name: string): Promise<LandmarkInfo | null> => {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return {
      title: data.title,
      extract: data.extract,
      thumbnail: data.thumbnail?.source,
      pageid: data.pageid
    };
  } catch (error) {
    console.error("Wikipedia API Error:", error);
    return null;
  }
};

export const getNearbyPlaces = async (lat: number, lon: number) => {
  try {
    // OpenTripMap API call placeholder
    // Requires API Key: process.env.OPENTRIPMAP_API_KEY
    return [];
  } catch (error) {
    console.error("OpenTripMap Error:", error);
    return [];
  }
};

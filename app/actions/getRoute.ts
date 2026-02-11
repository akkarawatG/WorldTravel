// app/actions/getRoute.ts
'use server'

const ORS_API_KEY = "5b3ce3597851110001cf6248a9c10d5dc92e4296a2c48139c95556df"; // Key จากเอกสาร

export async function getRoute(coordinates: [number, number][]) {
  if (coordinates.length < 2) return null;

  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
      {
        method: 'POST',
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: coordinates
        })
      }
    );

    if (!response.ok) {
      console.error(`ORS API Error: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch route:", error);
    return null;
  }
}
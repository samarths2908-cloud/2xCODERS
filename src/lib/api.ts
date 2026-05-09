// src/lib/api.ts

const GOOGLE_MAPS_API_KEY =
  "AIzaSyB8n750mf7SzyxAZJRNXMpD3_h9pa4hXc8";

const OPEN_CHARGE_MAP_API_KEY =
  "03c8f7a7-9af8-4fc4-a25f-d5268c606191";

export async function fetchNearbyStations(
  latitude: number,
  longitude: number
) {
  const response = await fetch(
    `https://api.openchargemap.io/v3/poi/?output=json&latitude=${latitude}&longitude=${longitude}&distance=15&maxresults=20&key=${OPEN_CHARGE_MAP_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch charging stations");
  }

  return response.json();
}

export async function fetchRouteETA(
  origin: string,
  destination: string
) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch route ETA");
  }

  return response.json();
}

export async function fetchStationAvailability() {
  return {
    availablePorts: Math.floor(Math.random() * 4),
    queueLength: Math.floor(Math.random() * 5),
    updatedAt: new Date().toISOString(),
  };
}
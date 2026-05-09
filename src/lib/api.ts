import type { Station } from "./charging";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const OPEN_CHARGE_MAP_API_KEY = process.env.NEXT_PUBLIC_OPEN_CHARGE_MAP_API_KEY || "";

/**
 * @interface OpenChargePoi - Type definition for OpenChargeMap POI response.
 */
type OpenChargePoi = {
  AddressInfo?: {
    Title?: string;
    Distance?: number;
  };
  NumberOfPoints?: number;
  Connections?: {
    PowerKW?: number;
  }[];
  StatusType?: {
    IsOperational?: boolean;
    Title?: string;
  };
};

/**
 * Helper mapper to convert external API data to internal Station format.
 */
function toStation(item: OpenChargePoi, index: number): Station {
  const powerKW = item.Connections?.[0]?.PowerKW ?? 120;
  const distanceKm = item.AddressInfo?.Distance ?? 1 + index * 0.8;

  return {
    id: `real-${index}`,
    name: item.AddressInfo?.Title ?? `Charging Station ${index + 1}`,
    distanceKm,
    queueLength: index % 3,
    avgSessionMinutes: Math.max(10, Math.round(60 / Math.max(powerKW, 1))),
    chargerKW: powerKW,
    batteryCapacityKWh: 75,
    availablePorts: Math.max(1, item.NumberOfPoints ?? 1),
    status: item.StatusType?.Title?.toLowerCase().includes("available")
      ? "Free"
      : index % 4 === 0
      ? "Free"
      : index % 4 === 1
      ? "Busy"
      : index % 4 === 2
      ? "Charging"
      : "Delayed",
  };
}

/**
 * Fetches raw station data from OpenChargeMap.
 */
export async function fetchNearbyStations(latitude: number, longitude: number): Promise<OpenChargePoi[]> {
  const url = `https://api.openchargemap.io/v3/poi/?output=json&maxresults=20&latitude=${latitude}&longitude=${longitude}&distance=10&distanceunit=KM&key=${OPEN_CHARGE_MAP_API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch charging stations");
  }

  return response.json();
}

/**
 * Loads real stations and transforms them into the internal RankedStation/Station format.
 */
export async function loadRealStations(latitude: number, longitude: number): Promise<Station[]> {
  const rawData: OpenChargePoi[] = await fetchNearbyStations(latitude, longitude);
  return rawData.slice(0, 8).map((item, index) => toStation(item, index));
}

/**
 * Fetches ETA data from Google Maps Distance Matrix API.
 */
export async function fetchRouteETA(origin: string, destination: string): Promise<any> {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch route ETA");
  }

  return response.json();
}

/**
 * Simulates or fetches real-time port availability updates.
 */
export async function fetchStationAvailability() {
  return {
    availablePorts: Math.floor(Math.random() * 4),
    queueLength: Math.floor(Math.random() * 5),
    updatedAt: new Date().toISOString(),
  };
}

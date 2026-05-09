import type { Station } from "./charging";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const OPEN_CHARGE_MAP_API_KEY = process.env.NEXT_PUBLIC_OPEN_CHARGE_MAP_API_KEY || "";

type OpenChargePoi = {
  AddressInfo?: {
    Title?: string;
    Distance?: number;
    Latitude?: number;
    Longitude?: number;
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

function toStation(item: OpenChargePoi, index: number): Station {
  const powerKW = item.Connections?.[0]?.PowerKW ?? 120;
  const distanceKm = item.AddressInfo?.Distance ?? (1 + index * 0.8);

  let internalStatus: "Free" | "Busy" | "Charging" | "Delayed" = "Free";
  const rawStatus = item.StatusType?.Title?.toLowerCase() || "";

  if (rawStatus.includes("available") || rawStatus.includes("operational")) {
    internalStatus = "Free";
  } else if (rawStatus.includes("occupied") || rawStatus.includes("in use")) {
    internalStatus = "Charging";
  } else if (rawStatus.includes("busy") || rawStatus.includes("partially")) {
    internalStatus = "Busy";
  } else if (rawStatus.includes("out of order") || rawStatus.includes("broken")) {
    internalStatus = "Delayed";
  } else {
    const states: ("Free" | "Busy" | "Charging" | "Delayed")[] = ["Free", "Busy", "Charging", "Delayed"];
    internalStatus = states[index % 4];
  }

  return {
    id: `real-${index}`,
    name: item.AddressInfo?.Title ?? `Charging Station ${index + 1}`,
    distanceKm,
    queueLength: index % 3,
    avgSessionMinutes: Math.max(10, Math.round(60 / Math.max(powerKW, 1))),
    chargerKW: powerKW,
    batteryCapacityKWh: 75,
    availablePorts: Math.max(1, item.NumberOfPoints ?? 1),
    status: internalStatus,
  };
}

export async function fetchNearbyStations(latitude: number, longitude: number): Promise<OpenChargePoi[]> {
  if (!OPEN_CHARGE_MAP_API_KEY) {
    console.warn("OpenChargeMap API key is missing. Using fallback.");
    return [];
  }

  const url = `https://api.openchargemap.io/v3/poi/?output=json&maxresults=20&latitude=${latitude}&longitude=${longitude}&distance=10&distanceunit=KM&key=${OPEN_CHARGE_MAP_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching nearby stations:", error);
    return [];
  }
}

export async function loadRealStations(latitude: number, longitude: number): Promise<Station[]> {
  const rawData: OpenChargePoi[] = await fetchNearbyStations(latitude, longitude);
  if (rawData.length === 0) return [];
  return rawData.slice(0, 8).map((item, index) => toStation(item, index));
}

export async function fetchRouteETA(origin: string, destination: string): Promise<any> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn("Google Maps API key is missing.");
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching route ETA:", error);
    return null;
  }
}

export async function fetchStationAvailability() {
  return {
    availablePorts: Math.floor(Math.random() * 4),
    queueLength: Math.floor(Math.random() * 5),
    updatedAt: new Date().toISOString(),
  };
}

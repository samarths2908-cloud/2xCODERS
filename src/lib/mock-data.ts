import { Station } from "./types";

const CITIES = [
  { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, coastal: false },
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777, coastal: true },
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946, coastal: false },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, coastal: true },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, coastal: true },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, coastal: false },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, coastal: false },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, coastal: false },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, coastal: false },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, coastal: false },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, coastal: false },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, coastal: false },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, coastal: false },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, coastal: true },
  { name: "Srinagar", state: "J&K", lat: 34.0837, lng: 74.7973, coastal: false },
  { name: "Leh", state: "Ladakh", lat: 34.1526, lng: 77.5771, coastal: false },
  { name: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278, coastal: true },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577, coastal: false },
  { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, coastal: false },
  { name: "Visakhapatnam", state: "Andhra", lat: 17.6868, lng: 83.2185, coastal: true }
];

const OPERATORS = ["Tata Power", "Jio-bp", "Zeon Charging", "ChargeZone", "Magenta", "Fortum", "Ather", "Glida"];
const PREFIXES = ["VoltHub", "EcoNode", "HyperPort", "GridPoint", "SuperPulse", "GreenCore", "PureStation", "SmartNode"];
const CONNECTORS = ["CCS2", "Type 2", "GB/T"];

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateSyntheticStations(count: number): Station[] {
  const stations: Station[] = [];
  
  for (let i = 0; i < count; i++) {
    const city = CITIES[i % CITIES.length];
    
    // Tight jitter for coastal cities to prevent ocean placement
    // Inland cities can spread a bit more (up to 40km), coastal only ~5-8km
    const jitterScale = city.coastal ? 0.08 : 0.4;
    
    let latJitter = (pseudoRandom(i * 13) - 0.5) * jitterScale;
    let lngJitter = (pseudoRandom(i * 37) - 0.5) * jitterScale;

    // For coastal cities, explicitly nudge jitter inland if possible
    if (city.coastal) {
      if (city.name === "Mumbai") lngJitter = Math.abs(lngJitter); // Nudge East
      if (city.name === "Chennai") lngJitter = -Math.abs(lngJitter); // Nudge West
      if (city.name === "Kochi") lngJitter = Math.abs(lngJitter); // Nudge East
      if (city.name === "Panaji") lngJitter = Math.abs(lngJitter); // Nudge East
      if (city.name === "Visakhapatnam") lngJitter = -Math.abs(lngJitter); // Nudge West
    }

    const lat = city.lat + latJitter;
    const lng = city.lng + lngJitter;
    
    const totalPorts = (Math.floor(pseudoRandom(i * 2) * 8)) + 4;
    const availablePorts = Math.floor(pseudoRandom(i * 5) * (totalPorts + 1));
    const powers = [50, 60, 120, 150, 250];
    const chargerKW = powers[Math.floor(pseudoRandom(i * 7) * powers.length)];
    
    stations.push({
      id: `tactical-node-${i}`,
      name: `${PREFIXES[i % PREFIXES.length]} ${city.name} Sector ${Math.floor(pseudoRandom(i) * 99)}`,
      city: city.name,
      state: city.state,
      latitude: lat,
      longitude: lng,
      location: { lat, lng },
      totalPorts,
      availablePorts,
      avgSessionMinutes: Math.floor(pseudoRandom(i * 9) * 20) + 30,
      chargerKW,
      batteryCapacityKWh: 80,
      queueLength: availablePorts === 0 ? Math.floor(pseudoRandom(i * 3) * 4) + 1 : 0,
      status: availablePorts > 0 ? "Free" : "Busy",
      operator: OPERATORS[i % OPERATORS.length],
      connectorType: CONNECTORS[i % CONNECTORS.length],
      distanceKm: 0,
      usageType: pseudoRandom(i) > 0.8 ? "Commercial" : "Public"
    });
  }
  
  return stations;
}

export const demoStations: Station[] = generateSyntheticStations(400);
export const MOCK_STATIONS = demoStations;
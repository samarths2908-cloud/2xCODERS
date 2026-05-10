import { Station } from "./types";

const CITIES = [
  { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, weight: 1.5 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777, weight: 1.5 },
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946, weight: 1.3 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, weight: 1.2 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, weight: 1.2 },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, weight: 1.1 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, weight: 1.0 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, weight: 1.0 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, weight: 0.9 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, weight: 0.9 },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, weight: 0.8 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, weight: 0.8 },
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096, weight: 0.7 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, weight: 0.7 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, weight: 0.8 },
  { name: "Srinagar", state: "J&K", lat: 34.0837, lng: 74.7973, weight: 0.6 },
  { name: "Leh", state: "Ladakh", lat: 34.1526, lng: 77.5771, weight: 0.4 },
  { name: "Tawang", state: "Arunachal", lat: 27.5854, lng: 91.8594, weight: 0.4 },
  { name: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278, weight: 0.6 },
  { name: "Visakhapatnam", state: "Andhra", lat: 17.6868, lng: 83.2185, weight: 0.8 }
];

const OPERATORS = ["Tata Power", "Jio-bp", "Zeon Charging", "ChargeZone", "Magenta", "Fortum", "Ather", "Glida"];
const PREFIXES = ["VoltHub", "EcoNode", "HyperPort", "GridPoint", "SuperPulse", "GreenCore", "PureStation", "SmartNode"];
const CONNECTORS = ["CCS2", "Type 2", "GB/T"];

// Deterministic random for SSR hydration safety
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateSyntheticStations(count: number): Station[] {
  const stations: Station[] = [];
  
  for (let i = 0; i < count; i++) {
    // Pick an anchor city based on weighted distribution
    const cityIndex = i % CITIES.length;
    const city = CITIES[cityIndex];
    
    // Generate jittered coordinates around the city to avoid spirals or chains
    // Using index-based pseudo-randomness for SSR consistency
    const latJitter = (pseudoRandom(i * 13) - 0.5) * (3 / city.weight);
    const lngJitter = (pseudoRandom(i * 37) - 0.5) * (3 / city.weight);
    
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
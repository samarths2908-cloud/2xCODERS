import { Station } from "./types";

const CITIES = [
  // North
  { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  // West
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
  // South
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Mangalore", state: "Karnataka", lat: 12.9141, lng: 74.8560 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  // East
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245 },
  // Central
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  // Northeast
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362 }
];

const OPERATORS = ["Tata Power", "Jio-bp", "Zeon Charging", "Statcon Energia", "ChargeZone", "Magenta Mobility", "Fortum", "Ather Grid", "SNAKE", "Glida"];
const PREFIXES = ["Volt", "Green", "Eco", "Smart", "Hyper", "Neo", "Pure", "Fast", "Super", "Grid"];
const SUFFIXES = ["Hub", "Nexus", "Station", "Point", "Node", "Vector", "Pulse", "Core", "Port", "Link"];
const CONNECTORS = ["CCS2", "CHAdeMO", "Type 2", "GB/T", "NACS"];

function generateSyntheticStations(count: number): Station[] {
  const stations: Station[] = [];
  
  for (let i = 0; i < count; i++) {
    // Pick a random city anchor
    const city = CITIES[i % CITIES.length];
    const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    
    // Spread around the city center (0.3 degrees is approx 30km spread)
    // We use city anchors to ensure markers stay on land
    const latOffset = (Math.random() - 0.5) * 0.6;
    const lngOffset = (Math.random() - 0.5) * 0.6;
    
    const lat = city.lat + latOffset;
    const lng = city.lng + lngOffset;
    
    const totalPorts = Math.floor(Math.random() * 8) + 2;
    const availablePorts = Math.floor(Math.random() * (totalPorts + 1));
    const chargerKW = [25, 50, 60, 120, 150, 250][Math.floor(Math.random() * 6)];
    
    stations.push({
      id: `synthetic-${i}`,
      name: `${prefix}${suffix} ${city.name} ${i % 5 === 0 ? 'Express' : ''}`,
      city: city.name,
      state: city.state,
      latitude: lat,
      longitude: lng,
      location: { lat, lng },
      totalPorts,
      availablePorts,
      avgSessionMinutes: Math.floor(Math.random() * 30) + 25,
      chargerKW,
      batteryCapacityKWh: 80,
      queueLength: availablePorts === 0 ? Math.floor(Math.random() * 3) + 1 : 0,
      status: availablePorts > 0 ? "Free" : "Busy",
      operator,
      connectorType: CONNECTORS[Math.floor(Math.random() * CONNECTORS.length)],
      distanceKm: 0, // Calculated dynamically
      usageType: Math.random() > 0.3 ? "Public" : "Commercial"
    });
  }
  
  return stations;
}

export const demoStations: Station[] = generateSyntheticStations(400);
export const MOCK_STATIONS = demoStations;

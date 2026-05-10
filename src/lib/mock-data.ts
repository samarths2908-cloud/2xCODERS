import { Station } from "./types";

const CITIES = [
  // North (As per image: Leh, Lucknow)
  { name: "Leh", state: "Ladakh", lat: 34.1526, lng: 77.5771 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973 },
  // West (As per image: Jaisalmer, Jodhpur, Vadodara, Panaji)
  { name: "Jaisalmer", state: "Rajasthan", lat: 26.9157, lng: 70.9160 },
  { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243 },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812 },
  { name: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  // Central (As per image: Bhopal, Raipur)
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  // East (As per image: Ranchi, Paradeep)
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 },
  { name: "Paradeep", state: "Odisha", lat: 20.3165, lng: 86.6109 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  // Northeast (As per image: Tawang, Tezpur, Aizawl)
  { name: "Tawang", state: "Arunachal Pradesh", lat: 27.5854, lng: 91.8594 },
  { name: "Tezpur", state: "Assam", lat: 26.6338, lng: 92.7926 },
  { name: "Aizawl", state: "Mizoram", lat: 23.7271, lng: 92.7176 },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362 },
  // South (As per image: Mangalore, Salem)
  { name: "Mangalore", state: "Karnataka", lat: 12.9141, lng: 74.8560 },
  { name: "Salem", state: "Tamil Nadu", lat: 11.6643, lng: 78.1460 },
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 }
];

const OPERATORS = ["Tata Power", "Jio-bp", "Zeon Charging", "ChargeZone", "Magenta Mobility", "Fortum", "Ather Grid", "SNAKE", "Glida"];
const PREFIXES = ["VoltHub", "EcoNode", "HyperPort", "GridPoint", "SuperPulse", "GreenCore", "PureStation", "SmartNode", "NeoVector"];
const CONNECTORS = ["CCS2", "Type 2", "GB/T", "CHAdeMO"];

function generateSyntheticStations(count: number): Station[] {
  const stations: Station[] = [];
  
  for (let i = 0; i < count; i++) {
    const city = CITIES[i % CITIES.length];
    const operator = OPERATORS[(i * 7) % OPERATORS.length];
    const prefix = PREFIXES[(i * 3) % PREFIXES.length];
    
    // Deterministic spread around city center to match the visual distribution
    // Using larger spread for wider tactical coverage
    const latOffset = Math.sin(i * 1.5) * 1.2;
    const lngOffset = Math.cos(i * 1.5) * 1.2;
    
    const lat = city.lat + latOffset;
    const lng = city.lng + lngOffset;
    
    const totalPorts = (i % 8) + 4;
    const availablePorts = (i * 13) % (totalPorts + 1);
    const powers = [50, 60, 120, 150, 250];
    const chargerKW = powers[i % powers.length];
    
    stations.push({
      id: `tactical-node-${i}`,
      name: `${prefix} ${city.name} ${i % 10 === 0 ? 'Prime' : (i % 5 === 0 ? 'Alpha' : i)}`,
      city: city.name,
      state: city.state,
      latitude: lat,
      longitude: lng,
      location: { lat, lng },
      totalPorts,
      availablePorts,
      avgSessionMinutes: ((i * 17) % 25) + 30,
      chargerKW,
      batteryCapacityKWh: 80,
      queueLength: availablePorts === 0 ? (i % 4) + 1 : 0,
      status: availablePorts > 0 ? "Free" : "Busy",
      operator,
      connectorType: CONNECTORS[i % CONNECTORS.length],
      distanceKm: 0, 
      usageType: i % 10 < 8 ? "Public" : "Commercial"
    });
  }
  
  return stations;
}

export const demoStations: Station[] = generateSyntheticStations(420);
export const MOCK_STATIONS = demoStations;

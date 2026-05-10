import { Station } from "./types";

/**
 * Comprehensive list of anchor hubs across India.
 * Updated to include high-density request zones.
 */
const CITIES = [
  // High Density Priority Zones
  { name: "Solapur", state: "Maharashtra", lat: 17.6599, lng: 75.9064, coastal: false },
  { name: "Proddatur", state: "Andhra", lat: 14.7303, lng: 78.5516, coastal: false },
  { name: "Kondagaon", state: "Chhattisgarh", lat: 19.5851, lng: 81.6521, coastal: false },
  { name: "Kurnool", state: "Andhra", lat: 15.8281, lng: 78.0373, coastal: false },
  { name: "Davangere", state: "Karnataka", lat: 14.4644, lng: 75.9218, coastal: false },
  { name: "Nandurbar", state: "Maharashtra", lat: 21.3722, lng: 74.2391, coastal: false },
  { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243, coastal: false },
  { name: "Vijayawada", state: "Andhra", lat: 16.5062, lng: 80.6480, coastal: false },
  { name: "Guntur", state: "Andhra", lat: 16.3067, lng: 80.4365, coastal: false },
  
  // North & Far North
  { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, coastal: false },
  { name: "Chandigarh", state: "Punjab", lat: 30.7333, lng: 76.7794, coastal: false },
  { name: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723, coastal: false },
  { name: "Srinagar", state: "J&K", lat: 34.0837, lng: 74.7973, coastal: false },
  { name: "Leh", state: "Ladakh", lat: 34.1526, lng: 77.5771, coastal: false },
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322, coastal: false },
  { name: "Shimla", state: "HP", lat: 31.1048, lng: 77.1734, coastal: false },

  // South & Deep South
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946, coastal: false },
  { name: "Chennai", state: "TN", lat: 13.0827, lng: 80.2707, coastal: true },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, coastal: false },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, coastal: true },
  { name: "Mangalore", state: "Karnataka", lat: 12.9141, lng: 74.8560, coastal: true },
  { name: "Visakhapatnam", state: "Andhra", lat: 17.6868, lng: 83.2185, coastal: true },
  { name: "Madurai", state: "TN", lat: 9.9252, lng: 78.1198, coastal: false },

  // West & Northwest
  { name: "Mumbai", state: "Mumbai", lat: 19.0760, lng: 72.8777, coastal: true },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, coastal: false },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, coastal: false },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, coastal: false },
  { name: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278, coastal: true },

  // East & Northeast
  { name: "Kolkata", state: "WB", lat: 22.5726, lng: 88.3639, coastal: true },
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245, coastal: false },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, coastal: false },
  { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, coastal: false },
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096, coastal: false },
  { name: "Shillong", state: "Meghalaya", lat: 25.5788, lng: 91.8933, coastal: false },

  // Central & Regional Hubs
  { name: "Bhopal", state: "MP", lat: 23.2599, lng: 77.4126, coastal: false },
  { name: "Indore", state: "MP", lat: 22.7196, lng: 75.8577, coastal: false },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, coastal: false },
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296, coastal: false },
  { name: "Lucknow", state: "UP", lat: 26.8467, lng: 80.9462, coastal: false },
  { name: "Varanasi", state: "UP", lat: 25.3176, lng: 82.9739, coastal: false },
];

const OPERATORS = ["Tata Power", "Jio-bp", "Zeon Charging", "ChargeZone", "Magenta", "Fortum", "Ather", "Glida"];
const PREFIXES = ["VoltHub", "EcoNode", "HyperPort", "GridPoint", "SuperPulse", "GreenCore", "PureStation", "SmartNode"];
const CONNECTORS = ["CCS2", "Type 2", "GB/T"];

/**
 * Deterministic pseudo-random number generator for stable hydration.
 */
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Calculates Haversine distance in Km
 */
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lng2 - lng1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generates synthetic stations with a density-focused proximity rejection rule.
 * Now specifically targeting Kurnool, Davangere, Nandurbar, Jodhpur, and AP hubs.
 */
function generateSyntheticStations(count: number): Station[] {
  const stations: Station[] = [];
  const minSpacingKm = 5; // Target spacing for priority zones
  
  let i = 0;
  let attempts = 0;
  const maxAttempts = count * 50;

  const PRIORITY_CITIES = ["Solapur", "Proddatur", "Kondagaon", "Kurnool", "Davangere", "Nandurbar", "Jodhpur", "Vijayawada", "Guntur"];

  while (stations.length < count && attempts < maxAttempts) {
    attempts++;
    const city = CITIES[i % CITIES.length];
    
    // Scale jitter for high density in specifically requested cities
    const isPriorityCity = PRIORITY_CITIES.includes(city.name);
    const jitterScale = isPriorityCity ? 0.35 : 1.5; 
    
    let latJitter = (pseudoRandom(attempts * 13) - 0.5) * jitterScale;
    let lngJitter = (pseudoRandom(attempts * 37) - 0.5) * jitterScale;

    // Coastline Safety: Nudge inland for coastal cities
    if (city.coastal) {
      if (city.lng < 78) lngJitter = Math.abs(lngJitter) * 1.5; 
      else lngJitter = -Math.abs(lngJitter) * 1.5;
    }

    const lat = city.lat + latJitter;
    const lng = city.lng + lngJitter;

    // Proximity rejection to maintain grid clarity
    // For priority cities we allow 5km, otherwise we keep it slightly more sparse for balance
    const currentMinSpacing = isPriorityCity ? 5 : 12;
    const isTooClose = stations.some(s => getDistance(lat, lng, s.latitude, s.longitude) < currentMinSpacing);

    if (!isTooClose) {
      const totalPorts = (Math.floor(pseudoRandom(attempts * 2) * 10)) + 4;
      const availablePorts = Math.floor(pseudoRandom(attempts * 5) * (totalPorts + 1));
      const powers = [60, 120, 150, 250];
      const chargerKW = powers[Math.floor(pseudoRandom(attempts * 7) * powers.length)];
      
      stations.push({
        id: `tactical-node-${stations.length}`,
        name: `${PREFIXES[stations.length % PREFIXES.length]} ${city.name} ${String.fromCharCode(65 + (stations.length % 26))}`,
        city: city.name,
        state: city.state,
        latitude: lat,
        longitude: lng,
        location: { lat, lng },
        totalPorts,
        availablePorts,
        avgSessionMinutes: Math.floor(pseudoRandom(attempts * 9) * 15) + 35,
        chargerKW,
        batteryCapacityKWh: 85,
        queueLength: availablePorts === 0 ? Math.floor(pseudoRandom(attempts * 3) * 5) + 1 : 0,
        status: availablePorts > 0 ? "Free" : "Busy",
        operator: OPERATORS[stations.length % OPERATORS.length],
        connectorType: CONNECTORS[stations.length % CONNECTORS.length],
        distanceKm: 0,
        usageType: pseudoRandom(attempts) > 0.85 ? "Commercial" : "Public"
      });
      i++;
    }
  }
  
  return stations;
}

// Generate 1000 tactical nodes for a highly dense nationwide grid.
export const demoStations: Station[] = generateSyntheticStations(1000);
export const MOCK_STATIONS = demoStations;

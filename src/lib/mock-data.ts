import { Station } from "./types";

/**
 * Comprehensive list of 45 anchor points across India to ensure even national spread.
 * Covers every major state and region.
 */
const CITIES = [
  // North
  { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, coastal: false },
  { name: "Chandigarh", state: "Punjab", lat: 30.7333, lng: 76.7794, coastal: false },
  { name: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723, coastal: false },
  { name: "Srinagar", state: "J&K", lat: 34.0837, lng: 74.7973, coastal: false },
  { name: "Leh", state: "Ladakh", lat: 34.1526, lng: 77.5771, coastal: false },
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322, coastal: false },
  { name: "Lucknow", state: "UP", lat: 26.8467, lng: 80.9462, coastal: false },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, coastal: false },
  { name: "Agra", state: "UP", lat: 27.1767, lng: 78.0081, coastal: false },
  { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243, coastal: false },
  { name: "Shimla", state: "HP", lat: 31.1048, lng: 77.1734, coastal: false },

  // South
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946, coastal: false },
  { name: "Chennai", state: "TN", lat: 13.0827, lng: 80.2707, coastal: true },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, coastal: false },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, coastal: true },
  { name: "Coimbatore", state: "TN", lat: 11.0168, lng: 76.9558, coastal: false },
  { name: "Madurai", state: "TN", lat: 9.9252, lng: 78.1198, coastal: false },
  { name: "Visakhapatnam", state: "Andhra", lat: 17.6868, lng: 83.2185, coastal: true },
  { name: "Mysore", state: "Karnataka", lat: 12.2958, lng: 76.6394, coastal: false },
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366, coastal: true },
  { name: "Vijayawada", state: "Andhra", lat: 16.5062, lng: 80.6480, coastal: false },
  { name: "Mangalore", state: "Karnataka", lat: 12.9141, lng: 74.8560, coastal: true },

  // West
  { name: "Mumbai", state: "Mumbai", lat: 19.0760, lng: 72.8777, coastal: true },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, coastal: false },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, coastal: false },
  { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311, coastal: true },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, coastal: false },
  { name: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278, coastal: true },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898, coastal: false },
  { name: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022, coastal: false },
  { name: "Bhopal", state: "MP", lat: 23.2599, lng: 77.4126, coastal: false },
  { name: "Indore", state: "MP", lat: 22.7196, lng: 75.8577, coastal: false },

  // East
  { name: "Kolkata", state: "WB", lat: 22.5726, lng: 88.3639, coastal: true },
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245, coastal: false },
  { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, coastal: false },
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096, coastal: false },
  { name: "Jamshedpur", state: "Jharkhand", lat: 22.8046, lng: 86.2029, coastal: false },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, coastal: false },
  { name: "Shillong", state: "Meghalaya", lat: 25.5788, lng: 91.8933, coastal: false },
  { name: "Agartala", state: "Tripura", lat: 23.8315, lng: 91.2868, coastal: false },
  { name: "Imphal", state: "Manipur", lat: 24.8170, lng: 93.9368, coastal: false },
  { name: "Aizawl", state: "Mizoram", lat: 23.7271, lng: 92.7176, coastal: false },

  // Central
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296, coastal: false },
  { name: "Jabalpur", state: "MP", lat: 23.1815, lng: 79.9864, coastal: false },
  { name: "Gwalior", state: "MP", lat: 26.2124, lng: 78.1772, coastal: false },
  { name: "Varanasi", state: "UP", lat: 25.3176, lng: 82.9739, coastal: false },
  { name: "Kanpur", state: "UP", lat: 26.4499, lng: 80.3319, coastal: false },
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
 * Calculates Haversine distance in Km (simple version for generation check)
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
 * Generates synthetic stations with a proximity rejection rule to ensure even spread.
 * Targeting ~10 stations per hub area to meet the user's request across the national grid.
 */
function generateSyntheticStations(count: number): Station[] {
  const stations: Station[] = [];
  const minSpacingKm = 15; // Ensure at least 15km between generated points in a cluster
  
  let i = 0;
  let attempts = 0;
  const maxAttempts = count * 10;

  while (stations.length < count && attempts < maxAttempts) {
    attempts++;
    const city = CITIES[i % CITIES.length];
    
    // Use a larger jitter but still anchor to cities for land-safety
    const jitterScale = city.coastal ? 0.15 : 0.8; 
    let latJitter = (pseudoRandom(attempts * 13) - 0.5) * jitterScale;
    let lngJitter = (pseudoRandom(attempts * 37) - 0.5) * jitterScale;

    // Coastline Safety: Nudge inland for coastal cities
    if (city.coastal) {
      if (city.lng < 78) lngJitter = Math.abs(lngJitter) * 1.5; // West Coast -> Nudge East
      else lngJitter = -Math.abs(lngJitter) * 1.5; // East Coast -> Nudge West
    }

    const lat = city.lat + latJitter;
    const lng = city.lng + lngJitter;

    // PROXIMITY REJECTION: Check if this point is too close to any existing point
    const isTooClose = stations.some(s => getDistance(lat, lng, s.latitude, s.longitude) < minSpacingKm);

    if (!isTooClose) {
      const totalPorts = (Math.floor(pseudoRandom(attempts * 2) * 8)) + 4;
      const availablePorts = Math.floor(pseudoRandom(attempts * 5) * (totalPorts + 1));
      const powers = [50, 60, 120, 150, 250];
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
        avgSessionMinutes: Math.floor(pseudoRandom(attempts * 9) * 20) + 30,
        chargerKW,
        batteryCapacityKWh: 80,
        queueLength: availablePorts === 0 ? Math.floor(pseudoRandom(attempts * 3) * 4) + 1 : 0,
        status: availablePorts > 0 ? "Free" : "Busy",
        operator: OPERATORS[stations.length % OPERATORS.length],
        connectorType: CONNECTORS[stations.length % CONNECTORS.length],
        distanceKm: 0,
        usageType: pseudoRandom(attempts) > 0.8 ? "Commercial" : "Public"
      });
      i++;
    }
  }
  
  return stations;
}

// Targeting ~450 stations (~10 per hub across 45 hubs) to ensure clean "each state" representation.
export const demoStations: Station[] = generateSyntheticStations(450);
export const MOCK_STATIONS = demoStations;

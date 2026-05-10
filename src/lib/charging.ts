import { Station, RankedStation, Location } from "./types";

/**
 * India Bounding Box
 */
const INDIA_BOUNDS = {
  lat: { min: 6, max: 38 },
  lng: { min: 68, max: 98 }
};

/**
 * Cleans and validates coordinates.
 * Swaps lat/lng if they appear reversed but would be valid for India.
 */
function cleanCoordinates(lat: number, lng: number) {
  let finalLat = lat;
  let finalLng = lng;
  let suspicious = false;

  // Auto-correct potential swap (Indian Longitudes are 70-90, Latitudes are 8-35)
  if (lat > 40 && lng < 40) {
    finalLat = lng;
    finalLng = lat;
  }

  // Validate bounds
  if (
    finalLat < INDIA_BOUNDS.lat.min || 
    finalLat > INDIA_BOUNDS.lat.max || 
    finalLng < INDIA_BOUNDS.lng.min || 
    finalLng > INDIA_BOUNDS.lng.max
  ) {
    suspicious = true;
  }

  return { lat: finalLat, lng: finalLng, suspicious };
}

/**
 * Calculates Haversine distance in Km
 */
function getHaversineDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in km
  const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
  const dLon = (loc2.lng - loc1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * (Math.PI / 180)) *
      Math.cos(loc2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates the ranking for stations based on total time efficiency relative to user location.
 */
export function rankStations(
  stations: Station[],
  currentBattery: number,
  targetBattery: number,
  userLocation: Location,
  avgSpeedKph: number = 40
): RankedStation[] {
  return stations.map(station => {
    // 1. Clean and Validate Coordinates
    const { lat, lng, suspicious } = cleanCoordinates(station.latitude, station.longitude);
    const validLocation = { lat, lng };

    // 2. Distance & Travel Time
    const distanceKm = getHaversineDistance(userLocation, validLocation);
    const travelMinutes = Math.ceil((distanceKm / avgSpeedKph) * 60);

    // 3. Wait Time (Queue * Avg Session / Effective Ports)
    const waitMinutes = station.availablePorts > 0 
      ? 0 
      : Math.max(0, Math.round((station.queueLength * station.avgSessionMinutes) / (station.totalPorts || 4)));

    // 4. Charge Time
    const energyNeeded = ((targetBattery - currentBattery) / 100) * station.batteryCapacityKWh;
    const efficiency = 0.85;
    const chargeMinutes = Math.round((energyNeeded / (station.chargerKW * efficiency)) * 60);

    const totalEffectiveMinutes = travelMinutes + waitMinutes + chargeMinutes;

    // Nearest distance is prioritized heavily in the scoring system
    // A lower score is better
    let score = totalEffectiveMinutes + (distanceKm * 2.5);
    
    // Penalty for suspicious GPS data
    if (suspicious) score += 1000;

    return {
      ...station,
      latitude: lat,
      longitude: lng,
      location: validLocation,
      isSuspicious: suspicious,
      distanceKm,
      travelMinutes,
      waitMinutes,
      chargeMinutes,
      totalEffectiveMinutes,
      score
    };
  }).sort((a, b) => a.score - b.score);
}

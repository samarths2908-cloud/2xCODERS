import { Station, RankedStation, Location } from "./types";

/**
 * India Bounding Box - Generous National Boundaries to include all states/UTs
 */
const INDIA_BOUNDS = {
  lat: { min: 6.0, max: 38.0 },
  lng: { min: 67.0, max: 98.0 }
};

/**
 * Cleans and validates coordinates.
 * Strictly checks if the point is within the national bounding box and applies land-safety labels.
 */
function validateCoordinates(lat: number, lng: number) {
  const isInside = 
    lat >= INDIA_BOUNDS.lat.min && 
    lat <= INDIA_BOUNDS.lat.max && 
    lng >= INDIA_BOUNDS.lng.min && 
    lng <= INDIA_BOUNDS.lng.max;

  return { lat, lng, suspicious: !isInside };
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
 * Calculates the ranking for stations based on total time efficiency and proximity.
 */
export function rankStations(
  stations: Station[],
  currentBattery: number,
  targetBattery: number,
  userLocation: Location,
  avgSpeedKph: number = 40
): RankedStation[] {
  return stations
    .map(station => {
      // 1. Validate Coordinates
      const { lat, lng, suspicious } = validateCoordinates(station.latitude, station.longitude);
      const validLocation = { lat, lng };

      // 2. Distance & Travel Time
      const distanceKm = getHaversineDistance(userLocation, validLocation);
      const travelMinutes = Math.ceil((distanceKm / avgSpeedKph) * 60);

      // 3. Wait Time
      // If ports are free, wait is 0. Otherwise, estimate based on queue.
      const waitMinutes = station.availablePorts > 0 
        ? 0 
        : Math.max(0, Math.round((station.queueLength * station.avgSessionMinutes) / (station.totalPorts || 4)));

      // 4. Charge Time
      const energyNeeded = ((targetBattery - currentBattery) / 100) * station.batteryCapacityKWh;
      const efficiency = 0.85;
      const chargeMinutes = Math.round((energyNeeded / (station.chargerKW * efficiency)) * 60);

      const totalEffectiveMinutes = travelMinutes + waitMinutes + chargeMinutes;

      // Ranking Score: Prioritize distance and efficiency
      // Smaller score is better. Distance is weighted heavily for immediate availability.
      let score = totalEffectiveMinutes + (distanceKm * 2.5);
      
      if (suspicious) score += 50000; // Deprioritize suspicious points heavily

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
    })
    .sort((a, b) => a.score - b.score);
}

import { Station, RankedStation, Location } from "./types";
import { estimateTravelTime } from "./utils/charging-calculator";

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
    // 1. Distance & Travel Time
    const distanceKm = getHaversineDistance(userLocation, station.location);
    const travelMinutes = Math.ceil((distanceKm / avgSpeedKph) * 60);

    // 2. Wait Time (Queue * Avg Session / Effective Ports)
    const waitMinutes = station.availablePorts > 0 
      ? 0 
      : Math.max(0, Math.round((station.queueLength * station.avgSessionMinutes) / (station.totalPorts || 4)));

    // 3. Charge Time
    const energyNeeded = ((targetBattery - currentBattery) / 100) * station.batteryCapacityKWh;
    const efficiency = 0.85;
    const chargeMinutes = Math.round((energyNeeded / (station.chargerKW * efficiency)) * 60);

    const totalEffectiveMinutes = travelMinutes + waitMinutes + chargeMinutes;

    // Score calculation
    let score = totalEffectiveMinutes;
    // Boost nearby free stations
    if (station.status === 'Free') score -= 5;
    if (station.chargerKW > 100) score -= 5;
    
    // Weight distance heavily for "Nearest" prioritization
    score += distanceKm * 2;

    return {
      ...station,
      distanceKm,
      travelMinutes,
      waitMinutes,
      chargeMinutes,
      totalEffectiveMinutes,
      score
    };
  }).sort((a, b) => a.score - b.score);
}

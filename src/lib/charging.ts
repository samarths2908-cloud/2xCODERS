import { Station, RankedStation, Location } from "./types";
import { estimateTravelTime } from "./utils/charging-calculator";

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
    // 1. Travel Time based on actual user coordinates
    const travelMinutes = estimateTravelTime(
      userLocation.lat,
      userLocation.lng,
      station.location.lat,
      station.location.lng
    );

    // Update distanceKm for distance-based sorting
    const R = 6371;
    const dLat = (station.location.lat - userLocation.lat) * (Math.PI / 180);
    const dLon = (station.location.lng - userLocation.lng) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(userLocation.lat * (Math.PI / 180)) * Math.cos(station.location.lat * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    // 2. Wait Time (Queue * Avg Session / Effective Ports)
    const waitMinutes = station.availablePorts > 0 
      ? 0 
      : Math.max(0, Math.round((station.queueLength * station.avgSessionMinutes) / (station.totalPorts || 4)));

    // 3. Charge Time
    const energyNeeded = ((targetBattery - currentBattery) / 100) * station.batteryCapacityKWh;
    const efficiency = 0.85;
    const chargeMinutes = Math.round((energyNeeded / (station.chargerKW * efficiency)) * 60);

    const totalEffectiveMinutes = travelMinutes + waitMinutes + chargeMinutes;

    // Score: Lower is better. 
    // We weight distance highly for the "Nearest" requirement.
    let score = totalEffectiveMinutes + (distanceKm * 5); 
    
    if (station.status === 'Free') score -= 5;
    if (station.chargerKW > 100) score -= 5;

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

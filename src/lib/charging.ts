import { Station, RankedStation } from "./types";

/**
 * Calculates the ranking for stations based on total time efficiency.
 */
export function rankStations(
  stations: Station[],
  currentBattery: number,
  targetBattery: number,
  avgSpeedKph: number = 40
): RankedStation[] {
  return stations.map(station => {
    // 1. Travel Time
    const travelMinutes = Math.round((station.distanceKm / avgSpeedKph) * 60);

    // 2. Wait Time (Queue * Avg Session / Available Ports)
    // Simplified: If ports are available, wait is lower.
    const effectivePorts = Math.max(1, station.availablePorts);
    const waitMinutes = Math.max(0, Math.round((station.queueLength * station.avgSessionMinutes) / effectivePorts));

    // 3. Charge Time
    const energyNeeded = ((targetBattery - currentBattery) / 100) * station.batteryCapacityKWh;
    const chargeMinutes = Math.round((energyNeeded / (station.chargerKW * 0.9)) * 60);

    const totalEffectiveMinutes = travelMinutes + waitMinutes + chargeMinutes;

    // Score: Lower is better. Bonus for 'Free' status.
    let score = totalEffectiveMinutes;
    if (station.status === 'Free') score -= 5;
    if (station.availablePorts > 0) score -= 10;

    return {
      ...station,
      travelMinutes,
      waitMinutes,
      chargeMinutes,
      totalEffectiveMinutes,
      score
    };
  }).sort((a, b) => a.totalEffectiveMinutes - b.totalEffectiveMinutes);
}

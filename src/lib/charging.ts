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
    // Using a base travel time + scaling by distance
    const travelMinutes = Math.round((station.distanceKm / avgSpeedKph) * 60);

    // 2. Wait Time (Queue * Avg Session / Effective Ports)
    // We assume 1 port can clear 1 vehicle in avgSessionMinutes
    // If ports are available, wait is minimal.
    const effectivePorts = Math.max(1, station.availablePorts);
    const waitMinutes = station.availablePorts > 0 
      ? 0 
      : Math.max(0, Math.round((station.queueLength * station.avgSessionMinutes) / (station.totalPorts || 4)));

    // 3. Charge Time
    // Time (h) = Energy (kWh) / Power (kW)
    const energyNeeded = ((targetBattery - currentBattery) / 100) * station.batteryCapacityKWh;
    // Efficiency factor for DC charging (losses, cooling, etc.)
    const efficiency = 0.85;
    const chargeMinutes = Math.round((energyNeeded / (station.chargerKW * efficiency)) * 60);

    const totalEffectiveMinutes = travelMinutes + waitMinutes + chargeMinutes;

    // Score: Lower is better.
    // Bonus for 'Free' status and high power.
    let score = totalEffectiveMinutes;
    if (station.status === 'Free') score -= 5;
    if (station.chargerKW > 200) score -= 10;

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

import { Station, Location } from './types';

/**
 * Estimates the time required to charge an EV battery from current to target percentage.
 */
export const estimateChargeTime = (
  currentPercent: number,
  targetPercent: number,
  chargerKW: number,
  batteryCapacityKWh: number
): number => {
  if (currentPercent >= targetPercent) return 0;
  const energyNeeded = ((targetPercent - currentPercent) / 100) * batteryCapacityKWh;
  const efficiency = 0.9; // Standard 90% charging efficiency
  return Math.ceil((energyNeeded / (chargerKW * efficiency)) * 60);
};

/**
 * Calculates travel time based on Haversine distance and average speed.
 */
export const calculateTravelTime = (
  userLoc: Location,
  stationLoc: Location,
  averageSpeedKmph: number = 40
): number => {
  const R = 6371; // Earth radius in km
  const dLat = (stationLoc.latitude - userLoc.latitude) * (Math.PI / 180);
  const dLon = (stationLoc.longitude - userLoc.longitude) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLoc.latitude * (Math.PI / 180)) *
      Math.cos(stationLoc.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.ceil((distance / averageSpeedKmph) * 60);
};

/**
 * Calculates estimated wait time based on queue length and avg session duration.
 */
export const calculateWaitTime = (
  queueLength: number,
  avgSessionMinutes: number = 30
): number => {
  // Heuristic: Wait time is roughly distributed across available ports.
  // Using 2 as a conservative factor for port availability frequency.
  return Math.ceil(queueLength * (avgSessionMinutes / 2));
};

/**
 * Sums all time components into a total effective session time.
 */
export const calculateTotalEffectiveTime = (
  travelTime: number,
  waitTime: number,
  chargeTime: number
): number => {
  return travelTime + waitTime + chargeTime;
};

export interface StationRanking extends Station {
  estimates: {
    travelTime: number;
    waitTime: number;
    chargeTime: number;
    totalTime: number;
  };
}

/**
 * Ranks nearby stations by the fastest total effective time (travel + wait + charge).
 */
export const rankStationsByFastestOption = (
  stations: Station[],
  userLocation: Location,
  currentPercent: number,
  targetPercent: number,
  batteryCapacityKWh: number
): StationRanking[] => {
  return stations.map(station => {
    const travelTime = calculateTravelTime(userLocation, station.location);
    // Queue length derived from total vs available ports
    const queueLength = Math.max(0, station.totalPorts - station.availablePorts);
    const waitTime = calculateWaitTime(queueLength);
    
    // Assume 150kW for standard, 250kW for specific high-power hubs
    const chargerKW = station.id === 'st-3' ? 250 : 150; 
    const chargeTime = estimateChargeTime(currentPercent, targetPercent, chargerKW, batteryCapacityKWh);
    const totalTime = calculateTotalEffectiveTime(travelTime, waitTime, chargeTime);

    return {
      ...station,
      estimates: { travelTime, waitTime, chargeTime, totalTime }
    };
  }).sort((a, b) => a.estimates.totalTime - b.estimates.totalTime);
};

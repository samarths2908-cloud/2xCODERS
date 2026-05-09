import { Station } from '../types';

export const calculateChargingTime = (
  currentBattery: number,
  targetBattery: number,
  capacityKWh: number,
  powerKW: number
): number => {
  const energyNeeded = ((targetBattery - currentBattery) / 100) * capacityKWh;
  // Assume some efficiency factor
  const efficiency = 0.9;
  return Math.ceil((energyNeeded / (powerKW * efficiency)) * 60);
};

export const estimateTravelTime = (
  userLat: number,
  userLng: number,
  stationLat: number,
  stationLng: number
): number => {
  // Rough Haversine distance estimate converted to time (avg 40km/h in city)
  const R = 6371;
  const dLat = (stationLat - userLat) * (Math.PI / 180);
  const dLon = (stationLng - userLng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLat * (Math.PI / 180)) *
      Math.cos(stationLat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.ceil((distance / 40) * 60); // minutes
};

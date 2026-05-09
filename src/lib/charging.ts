export type Station = {
  id: string;
  name: string;
  distanceKm: number;
  queueLength: number;
  avgSessionMinutes: number;
  chargerKW: number;
  batteryCapacityKWh: number;
  availablePorts: number;
  status: "Free" | "Busy" | "Charging" | "Delayed";
};

export type RankedStation = Station & {
  travelTime: number;
  waitTime: number;
  chargeTime: number;
  totalEffectiveTime: number;
};

export function estimateChargeTime(
  currentPercent: number,
  targetPercent: number,
  chargerKW: number,
  batteryCapacityKWh: number
): number {
  const percentToCharge = Math.max(0, targetPercent - currentPercent);

  const energyNeededKWh =
    (percentToCharge / 100) * batteryCapacityKWh;

  if (chargerKW <= 0) return Infinity;

  const hours = energyNeededKWh / chargerKW;

  return Math.ceil(hours * 60);
}

export function calculateTravelTime(
  distanceKm: number,
  averageSpeedKmph = 35
): number {
  if (averageSpeedKmph <= 0) return Infinity;

  return Math.ceil((distanceKm / averageSpeedKmph) * 60);
}

export function calculateWaitTime(
  queueLength: number,
  avgSessionMinutes: number
): number {
  return Math.max(0, queueLength) * Math.max(0, avgSessionMinutes);
}

export function calculateTotalEffectiveTime(
  travelTime: number,
  waitTime: number,
  chargeTime: number
): number {
  return travelTime + waitTime + chargeTime;
}

export function rankStationsByFastestOption(
  stations: Station[],
  currentPercent: number,
  targetPercent: number
): RankedStation[] {
  return stations
    .map((station) => {
      const travelTime = calculateTravelTime(station.distanceKm);

      const waitTime = calculateWaitTime(
        station.queueLength,
        station.avgSessionMinutes
      );

      const chargeTime = estimateChargeTime(
        currentPercent,
        targetPercent,
        station.chargerKW,
        station.batteryCapacityKWh
      );

      const totalEffectiveTime = calculateTotalEffectiveTime(
        travelTime,
        waitTime,
        chargeTime
      );

      return {
        ...station,
        travelTime,
        waitTime,
        chargeTime,
        totalEffectiveTime,
      };
    })
    .sort(
      (a, b) =>
        a.totalEffectiveTime - b.totalEffectiveTime
    );
}
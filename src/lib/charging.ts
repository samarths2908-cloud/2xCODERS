export type StationStatus = "Free" | "Busy" | "Charging" | "Delayed" | "Online";

export interface Station {
  id: string;
  name: string;
  distanceKm: number;
  queueLength: number;
  avgSessionMinutes: number;
  chargerKW: number;
  batteryCapacityKWh: number;
  availablePorts: number;
  totalPorts: number;
  status: StationStatus;
}

export interface StationRanking extends Station {
  travelTime: number;
  waitTime: number;
  chargeTime: number;
  totalEffectiveTime: number;
  recommendationScore: number;
}

export type RankedStation = StationRanking;

export function estimateChargeTime(
  currentPercent: number,
  targetPercent: number,
  chargerKW: number,
  batteryCapacityKWh: number
): number {
  const percentToCharge = Math.max(0, targetPercent - currentPercent);
  const energyNeededKWh = (percentToCharge / 100) * batteryCapacityKWh;

  if (chargerKW <= 0) return Infinity;

  return Math.ceil((energyNeededKWh / chargerKW) * 60);
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
): StationRanking[] {
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

      const availablePortBonus = station.availablePorts > 0 ? -5 : 10;
      const statusBonus =
        station.status === "Free"
          ? -10
          : station.status === "Online"
            ? -8
            : station.status === "Busy"
              ? 8
              : station.status === "Charging"
                ? 5
                : 12;

      const recommendationScore =
        totalEffectiveTime + availablePortBonus + statusBonus;

      return {
        ...station,
        travelTime,
        waitTime,
        chargeTime,
        totalEffectiveTime,
        recommendationScore,
      };
    })
    .sort((a, b) => {
      if (a.totalEffectiveTime !== b.totalEffectiveTime) {
        return a.totalEffectiveTime - b.totalEffectiveTime;
      }
      return a.recommendationScore - b.recommendationScore;
    });
}
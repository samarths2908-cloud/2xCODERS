
import type { Station } from "./charging";

export const demoStations: Station[] = [
  {
    id: "station-alpha",
    name: "Station Alpha",
    distanceKm: 1.2,
    queueLength: 0,
    avgSessionMinutes: 18,
    chargerKW: 120,
    batteryCapacityKWh: 75,
    availablePorts: 2,
    totalPorts: 4,
    status: "Free",
    location: { lat: 12.9786, lng: 77.5906 },
  },
  {
    id: "station-nova",
    name: "Station Nova",
    distanceKm: 2.4,
    queueLength: 2,
    avgSessionMinutes: 14,
    chargerKW: 150,
    batteryCapacityKWh: 75,
    availablePorts: 0,
    totalPorts: 6,
    status: "Busy",
    location: { lat: 12.9616, lng: 77.6046 },
  },
  {
    id: "station-volt",
    name: "Station Volt",
    distanceKm: 0.9,
    queueLength: 1,
    avgSessionMinutes: 20,
    chargerKW: 60,
    batteryCapacityKWh: 75,
    availablePorts: 1,
    totalPorts: 3,
    status: "Charging",
    location: { lat: 12.9756, lng: 77.5846 },
  },
  {
    id: "station-pulse",
    name: "Station Pulse",
    distanceKm: 3.8,
    queueLength: 0,
    avgSessionMinutes: 12,
    chargerKW: 180,
    batteryCapacityKWh: 75,
    availablePorts: 3,
    totalPorts: 5,
    status: "Free",
    location: { lat: 12.9916, lng: 77.5996 },
  },
];

export const MOCK_STATIONS = demoStations;
